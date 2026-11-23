import "server-only";
import { audit, execute, iso, now, query, queryOne } from "@/lib/db";
import type { LeadInput } from "@/lib/validate";

/**
 * Lead persistence.
 *
 * Every statement is parameterised. Note that the IP address is only ever
 * stored as a keyed hash: enough to rate-limit and to spot a repeat submitter,
 * but not personal data we would have to protect or disclose.
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
  created_at: Date;
  updated_at: Date;
};

export async function createLead(
  input: LeadInput,
  meta: { ipHash: string; status?: LeadStatus },
): Promise<number> {
  const timestamp = now();
  const row = await queryOne<{ id: number }>(
    `INSERT INTO leads
       (name, email, phone, company, service, budget, message,
        source_path, ip_hash, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING id`,
    [
      input.name,
      input.email,
      input.phone,
      input.company,
      input.service,
      input.budget,
      input.message,
      input.sourcePath,
      meta.ipHash,
      meta.status ?? "new",
      timestamp,
      timestamp,
    ],
  );

  const id = row?.id ?? 0;
  await audit({
    actor: "public",
    action: "lead.created",
    target: `lead:${id}`,
    detail: `service=${input.service} status=${meta.status ?? "new"}`,
    ipHash: meta.ipHash,
  });
  return id;
}

export async function listLeads(
  options: {
    status?: LeadStatus | "all";
    search?: string;
    limit?: number;
    offset?: number;
  } = {},
): Promise<{ rows: Lead[]; total: number }> {
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

  // `where` is assembled only from the string literals below — never from
  // request input. Every user-supplied value travels as a bound parameter,
  // which is what makes injection impossible here rather than merely unlikely.
  const where: string[] = [];
  const params: (string | number)[] = [];

  if (status) {
    params.push(status);
    where.push(`status = $${params.length}`);
  } else if (hideSpam) {
    where.push(`status <> 'spam'`);
  }
  if (like) {
    params.push(like);
    const p = `$${params.length}`;
    where.push(
      `(name ILIKE ${p} ESCAPE '\\' OR email ILIKE ${p} ESCAPE '\\'
        OR company ILIKE ${p} ESCAPE '\\' OR message ILIKE ${p} ESCAPE '\\')`,
    );
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const totalRow = await queryOne<{ n: number }>(
    `SELECT COUNT(*)::bigint AS n FROM leads ${clause}`,
    params,
  );

  const rows = await query<Lead>(
    `SELECT id, name, email, phone, company, service, budget, message,
            source_path, status, notes, created_at, updated_at
       FROM leads ${clause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  return { rows, total: totalRow?.n ?? 0 };
}

export async function getLead(id: number): Promise<Lead | undefined> {
  if (!Number.isInteger(id) || id <= 0) return undefined;
  return queryOne<Lead>(
    `SELECT id, name, email, phone, company, service, budget, message,
            source_path, status, notes, created_at, updated_at
       FROM leads WHERE id = $1`,
    [id],
  );
}

export async function updateLeadStatus(
  id: number,
  status: LeadStatus,
  actor: string,
): Promise<boolean> {
  if (!Number.isInteger(id) || id <= 0) return false;
  if (!LEAD_STATUSES.includes(status)) return false;

  const changed = await execute(
    `UPDATE leads SET status = $1, updated_at = $2 WHERE id = $3`,
    [status, now(), id],
  );

  if (changed > 0) {
    await audit({ actor, action: "lead.status_changed", target: `lead:${id}`, detail: status });
  }
  return changed > 0;
}

export async function updateLeadNotes(
  id: number,
  notes: string,
  actor: string,
): Promise<boolean> {
  if (!Number.isInteger(id) || id <= 0) return false;
  const changed = await execute(`UPDATE leads SET notes = $1, updated_at = $2 WHERE id = $3`, [
    notes.slice(0, 4000),
    now(),
    id,
  ]);
  if (changed > 0) {
    await audit({ actor, action: "lead.notes_updated", target: `lead:${id}` });
  }
  return changed > 0;
}

export async function deleteLead(id: number, actor: string): Promise<boolean> {
  if (!Number.isInteger(id) || id <= 0) return false;
  const changed = await execute(`DELETE FROM leads WHERE id = $1`, [id]);
  if (changed > 0) {
    await audit({ actor, action: "lead.deleted", target: `lead:${id}` });
  }
  return changed > 0;
}

export async function leadStats(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  last7Days: number;
  last30Days: number;
}> {
  const [totalRow, statusRows, recent] = await Promise.all([
    queryOne<{ n: number }>(`SELECT COUNT(*)::bigint AS n FROM leads`),
    query<{ status: string; n: number }>(
      `SELECT status, COUNT(*)::bigint AS n FROM leads GROUP BY status`,
    ),
    queryOne<{ d7: number; d30: number }>(
      `SELECT
         COUNT(*) FILTER (WHERE created_at > now() - interval '7 days')::bigint  AS d7,
         COUNT(*) FILTER (WHERE created_at > now() - interval '30 days')::bigint AS d30
       FROM leads`,
    ),
  ]);

  const byStatus: Record<string, number> = {};
  for (const status of LEAD_STATUSES) byStatus[status] = 0;
  for (const row of statusRows) byStatus[row.status] = row.n;

  return {
    total: totalRow?.n ?? 0,
    byStatus,
    last7Days: recent?.d7 ?? 0,
    last30Days: recent?.d30 ?? 0,
  };
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
        row.id, iso(row.created_at), row.status, row.name, row.email, row.phone,
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
