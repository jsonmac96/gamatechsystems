import "server-only";
import { audit, getDb, nowIso } from "@/lib/db";
import type { LeadInput } from "@/lib/validate";

/**
 * Lead persistence.
 *
 * Every statement is prepared and parameterised. Note that the IP address is
 * only ever stored as a keyed hash: enough to rate-limit and to spot a repeat
 * submitter, but not personal data we would have to protect or disclose.
 */

export const LEAD_STATUSES = ["new", "contacted", "qualified", "won", "lost", "spam"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  message: string;
  source_path: string;
  status: LeadStatus;
  notes: string;
  created_at: string;
  updated_at: string;
};

export function createLead(
  input: LeadInput,
  meta: { ipHash: string; status?: LeadStatus },
): number {
  const now = nowIso();
  const result = getDb()
    .prepare(
      `INSERT INTO leads
         (name, email, phone, company, service, budget, message,
          source_path, ip_hash, status, created_at, updated_at)
       VALUES
         (@name, @email, @phone, @company, @service, @budget, @message,
          @sourcePath, @ipHash, @status, @createdAt, @updatedAt)`,
    )
    .run({
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company,
      service: input.service,
      budget: input.budget,
      message: input.message,
      sourcePath: input.sourcePath,
      ipHash: meta.ipHash,
      status: meta.status ?? "new",
      createdAt: now,
      updatedAt: now,
    });

  const id = Number(result.lastInsertRowid);
  audit({
    actor: "public",
    action: "lead.created",
    target: `lead:${id}`,
    detail: `service=${input.service} status=${meta.status ?? "new"}`,
    ipHash: meta.ipHash,
  });
  return id;
}

export function listLeads(options: {
  status?: LeadStatus | "all";
  search?: string;
  limit?: number;
  offset?: number;
} = {}): { rows: Lead[]; total: number } {
  const db = getDb();
  const limit = clampInt(options.limit ?? 50, 1, 200);
  const offset = clampInt(options.offset ?? 0, 0, 100_000);
  const status = options.status && options.status !== "all" ? options.status : null;
  // "All" means everything a human should look at. Submissions caught by the
  // honeypot are shown only when the spam filter is chosen explicitly;
  // otherwise the inbox fills with noise and real enquiries get missed.
  const hideSpam = status === null;
  const search = (options.search ?? "").trim().slice(0, 80);
  // LIKE wildcards in user input are escaped so a search for "%" does not
  // silently match everything.
  const like = search ? `%${escapeLike(search)}%` : null;

  const where: string[] = [];
  const params: Record<string, string | number> = {};

  if (status) {
    where.push("status = @status");
    params.status = status;
  } else if (hideSpam) {
    where.push("status != 'spam'");
  }
  if (like) {
    where.push(
      `(name LIKE @like ESCAPE '\\' OR email LIKE @like ESCAPE '\\'
        OR company LIKE @like ESCAPE '\\' OR message LIKE @like ESCAPE '\\')`,
    );
    params.like = like;
  }
  // `clause` is assembled only from the string literals pushed above — never
  // from request input. Every user-supplied value travels as a bound @parameter,
  // which is what makes injection impossible here rather than merely unlikely.
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const total = (
    db.prepare(`SELECT COUNT(*) AS n FROM leads ${clause}`).get(params) as { n: number }
  ).n;

  const rows = db
    .prepare(
      `SELECT id, name, email, phone, company, service, budget, message,
              source_path, status, notes, created_at, updated_at
         FROM leads ${clause}
        ORDER BY created_at DESC
        LIMIT @limit OFFSET @offset`,
    )
    .all({ ...params, limit, offset }) as Lead[];

  return { rows, total };
}

export function getLead(id: number): Lead | undefined {
  if (!Number.isInteger(id) || id <= 0) return undefined;
  return getDb()
    .prepare(
      `SELECT id, name, email, phone, company, service, budget, message,
              source_path, status, notes, created_at, updated_at
         FROM leads WHERE id = ?`,
    )
    .get(id) as Lead | undefined;
}

export function updateLeadStatus(
  id: number,
  status: LeadStatus,
  actor: string,
): boolean {
  if (!Number.isInteger(id) || id <= 0) return false;
  if (!LEAD_STATUSES.includes(status)) return false;

  const result = getDb()
    .prepare(`UPDATE leads SET status = ?, updated_at = ? WHERE id = ?`)
    .run(status, nowIso(), id);

  if (result.changes > 0) {
    audit({ actor, action: "lead.status_changed", target: `lead:${id}`, detail: status });
  }
  return result.changes > 0;
}

export function updateLeadNotes(id: number, notes: string, actor: string): boolean {
  if (!Number.isInteger(id) || id <= 0) return false;
  const result = getDb()
    .prepare(`UPDATE leads SET notes = ?, updated_at = ? WHERE id = ?`)
    .run(notes.slice(0, 4000), nowIso(), id);
  if (result.changes > 0) {
    audit({ actor, action: "lead.notes_updated", target: `lead:${id}` });
  }
  return result.changes > 0;
}

export function deleteLead(id: number, actor: string): boolean {
  if (!Number.isInteger(id) || id <= 0) return false;
  const result = getDb().prepare(`DELETE FROM leads WHERE id = ?`).run(id);
  if (result.changes > 0) {
    audit({ actor, action: "lead.deleted", target: `lead:${id}` });
  }
  return result.changes > 0;
}

export function leadStats(): {
  total: number;
  byStatus: Record<string, number>;
  last7Days: number;
  last30Days: number;
} {
  const db = getDb();
  const total = (db.prepare(`SELECT COUNT(*) AS n FROM leads`).get() as { n: number }).n;

  const statusRows = db
    .prepare(`SELECT status, COUNT(*) AS n FROM leads GROUP BY status`)
    .all() as { status: string; n: number }[];

  const byStatus: Record<string, number> = {};
  for (const status of LEAD_STATUSES) byStatus[status] = 0;
  for (const row of statusRows) byStatus[row.status] = row.n;

  const since = (days: number) =>
    new Date(Date.now() - days * 86_400_000).toISOString();

  const last7Days = (
    db.prepare(`SELECT COUNT(*) AS n FROM leads WHERE created_at > ?`).get(since(7)) as {
      n: number;
    }
  ).n;
  const last30Days = (
    db.prepare(`SELECT COUNT(*) AS n FROM leads WHERE created_at > ?`).get(since(30)) as {
      n: number;
    }
  ).n;

  return { total, byStatus, last7Days, last30Days };
}

/** Export leads as CSV. Values are quoted and formula-injection is neutralised. */
export function leadsToCsv(rows: Lead[]): string {
  const header = [
    "id", "created_at", "status", "name", "email", "phone",
    "company", "service", "budget", "message", "source_path", "notes",
  ];
  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.id, row.created_at, row.status, row.name, row.email, row.phone,
        row.company, row.service, row.budget, row.message, row.source_path, row.notes,
      ]
        .map((value) => csvCell(value))
        .join(","),
    );
  }
  return lines.join("\r\n");
}

/**
 * Quote a CSV cell.
 *
 * Any value starting with =, +, - or @ is prefixed with a single quote: those
 * are interpreted as formulas by Excel and Google Sheets, which is how a lead
 * form becomes a spreadsheet code-execution vector (CSV injection).
 */
function csvCell(value: string | number): string {
  const text = String(value ?? "");
  const guarded = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${guarded.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

/** Escape LIKE metacharacters so user input cannot alter the pattern. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}
