import "server-only";
import { audit, getDb, nowIso } from "@/lib/db";
import { isValidSlug, type PostInput } from "@/lib/validate";
import { readingTimeMinutes, toPlainText } from "@/lib/markdown";

/** Blog persistence. All statements parameterised; slugs validated before use. */

export type PostStatus = "draft" | "published";

export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body_md: string;
  cover_alt: string;
  tags: string;
  meta_title: string;
  meta_description: string;
  status: PostStatus;
  author_name: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * The column list, interpolated into the SELECT statements below.
 *
 * This is a module constant, not request input — the only values that ever
 * reach a query are bound as `?` parameters.
 */
const SELECT_COLUMNS = `id, slug, title, excerpt, body_md, cover_alt, tags,
  meta_title, meta_description, status, author_name, published_at, created_at, updated_at`;

export type CreateResult =
  | { ok: true; id: number; slug: string }
  | { ok: false; message: string; field?: string };

export function createPost(input: PostInput, userId: number, actor: string): CreateResult {
  const db = getDb();
  const slug = ensureUniqueSlug(input.slug);
  const now = nowIso();
  const publishedAt = input.status === "published" ? now : null;

  try {
    const result = db
      .prepare(
        `INSERT INTO posts
           (slug, title, excerpt, body_md, cover_alt, tags, meta_title, meta_description,
            status, author_name, published_at, created_at, updated_at, created_by)
         VALUES
           (@slug, @title, @excerpt, @bodyMd, @coverAlt, @tags, @metaTitle, @metaDescription,
            @status, @authorName, @publishedAt, @createdAt, @updatedAt, @createdBy)`,
      )
      .run({
        slug,
        title: input.title,
        excerpt: input.excerpt || toPlainText(input.bodyMd, 200),
        bodyMd: input.bodyMd,
        coverAlt: input.coverAlt,
        tags: input.tags,
        metaTitle: input.metaTitle,
        metaDescription: input.metaDescription,
        status: input.status,
        authorName: input.authorName,
        publishedAt,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      });

    const id = Number(result.lastInsertRowid);
    audit({ actor, action: "post.created", target: `post:${id}`, detail: `${input.status} ${slug}` });
    return { ok: true, id, slug };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, field: "slug", message: "That URL slug is already in use." };
    }
    throw error;
  }
}

export type UpdateResult = { ok: true; slug: string } | { ok: false; message: string; field?: string };

export function updatePost(
  id: number,
  input: PostInput,
  actor: string,
): UpdateResult {
  if (!Number.isInteger(id) || id <= 0) return { ok: false, message: "Unknown post." };

  const db = getDb();
  const existing = db
    .prepare(`SELECT id, slug, status, published_at FROM posts WHERE id = ?`)
    .get(id) as Pick<Post, "id" | "slug" | "status" | "published_at"> | undefined;

  if (!existing) return { ok: false, message: "That post no longer exists." };

  const slug = input.slug === existing.slug ? existing.slug : ensureUniqueSlug(input.slug, id);

  // Keep the original publication date when re-saving an already published post;
  // stamp it the first time a draft goes live.
  const publishedAt =
    input.status === "published"
      ? (existing.published_at ?? nowIso())
      : null;

  try {
    db.prepare(
      `UPDATE posts SET
         slug = @slug, title = @title, excerpt = @excerpt, body_md = @bodyMd,
         cover_alt = @coverAlt, tags = @tags, meta_title = @metaTitle,
         meta_description = @metaDescription, status = @status,
         author_name = @authorName, published_at = @publishedAt, updated_at = @updatedAt
       WHERE id = @id`,
    ).run({
      id,
      slug,
      title: input.title,
      excerpt: input.excerpt || toPlainText(input.bodyMd, 200),
      bodyMd: input.bodyMd,
      coverAlt: input.coverAlt,
      tags: input.tags,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      status: input.status,
      authorName: input.authorName,
      publishedAt,
      updatedAt: nowIso(),
    });

    audit({ actor, action: "post.updated", target: `post:${id}`, detail: `${input.status} ${slug}` });
    return { ok: true, slug };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, field: "slug", message: "That URL slug is already in use." };
    }
    throw error;
  }
}

export function deletePost(id: number, actor: string): boolean {
  if (!Number.isInteger(id) || id <= 0) return false;
  const result = getDb().prepare(`DELETE FROM posts WHERE id = ?`).run(id);
  if (result.changes > 0) {
    audit({ actor, action: "post.deleted", target: `post:${id}` });
  }
  return result.changes > 0;
}

export function setPostStatus(id: number, status: PostStatus, actor: string): boolean {
  if (!Number.isInteger(id) || id <= 0) return false;
  if (status !== "draft" && status !== "published") return false;

  const db = getDb();
  const existing = db
    .prepare(`SELECT published_at FROM posts WHERE id = ?`)
    .get(id) as { published_at: string | null } | undefined;
  if (!existing) return false;

  const publishedAt = status === "published" ? (existing.published_at ?? nowIso()) : null;
  const result = db
    .prepare(`UPDATE posts SET status = ?, published_at = ?, updated_at = ? WHERE id = ?`)
    .run(status, publishedAt, nowIso(), id);

  if (result.changes > 0) {
    audit({ actor, action: "post.status_changed", target: `post:${id}`, detail: status });
  }
  return result.changes > 0;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** Published posts only — the public blog listing. */
export function listPublishedPosts(limit = 50, offset = 0): Post[] {
  return getDb()
    .prepare(
      `SELECT ${SELECT_COLUMNS} FROM posts
        WHERE status = 'published' AND published_at IS NOT NULL
        ORDER BY published_at DESC
        LIMIT ? OFFSET ?`,
    )
    .all(clamp(limit, 1, 200), clamp(offset, 0, 100_000)) as Post[];
}

export function countPublishedPosts(): number {
  return (
    getDb()
      .prepare(`SELECT COUNT(*) AS n FROM posts WHERE status = 'published'`)
      .get() as { n: number }
  ).n;
}

/** Every post regardless of status — admin listing only. */
export function listAllPosts(limit = 100, offset = 0): Post[] {
  return getDb()
    .prepare(
      `SELECT ${SELECT_COLUMNS} FROM posts
        ORDER BY (status = 'draft') DESC, COALESCE(published_at, created_at) DESC
        LIMIT ? OFFSET ?`,
    )
    .all(clamp(limit, 1, 500), clamp(offset, 0, 100_000)) as Post[];
}

/**
 * Fetch a post by slug.
 *
 * `includeDrafts` defaults to false so a public route can never leak an
 * unpublished draft by guessing its URL.
 */
export function getPostBySlug(slug: string, includeDrafts = false): Post | undefined {
  if (!isValidSlug(slug)) return undefined;
  const sql = includeDrafts
    ? `SELECT ${SELECT_COLUMNS} FROM posts WHERE slug = ?`
    : `SELECT ${SELECT_COLUMNS} FROM posts WHERE slug = ? AND status = 'published'`;
  return getDb().prepare(sql).get(slug) as Post | undefined;
}

export function getPostById(id: number): Post | undefined {
  if (!Number.isInteger(id) || id <= 0) return undefined;
  return getDb().prepare(`SELECT ${SELECT_COLUMNS} FROM posts WHERE id = ?`).get(id) as
    | Post
    | undefined;
}

/** Other published posts, for "keep reading" links (good for internal linking). */
export function relatedPosts(excludeId: number, limit = 3): Post[] {
  return getDb()
    .prepare(
      `SELECT ${SELECT_COLUMNS} FROM posts
        WHERE status = 'published' AND id != ?
        ORDER BY published_at DESC LIMIT ?`,
    )
    .all(Number.isInteger(excludeId) ? excludeId : 0, clamp(limit, 1, 12)) as Post[];
}

export function postStats(): { total: number; published: number; drafts: number } {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published
         FROM posts`,
    )
    .get() as { total: number; published: number | null };
  const published = row.published ?? 0;
  return { total: row.total, published, drafts: row.total - published };
}

// ---------------------------------------------------------------------------
// Derived helpers
// ---------------------------------------------------------------------------

export function postTags(post: Post): string[] {
  return post.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function postReadingTime(post: Post): number {
  return readingTimeMinutes(post.body_md);
}

export function postMetaTitle(post: Post): string {
  return post.meta_title || post.title;
}

export function postMetaDescription(post: Post): string {
  return post.meta_description || post.excerpt || toPlainText(post.body_md, 155);
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

/** Append -2, -3, ... until the slug is free. `excludeId` ignores the row being updated. */
function ensureUniqueSlug(base: string, excludeId?: number): string {
  const db = getDb();
  const root = isValidSlug(base) ? base : "post";
  let candidate = root;

  for (let suffix = 2; suffix < 200; suffix += 1) {
    const clash = excludeId
      ? db.prepare(`SELECT 1 FROM posts WHERE slug = ? AND id != ?`).get(candidate, excludeId)
      : db.prepare(`SELECT 1 FROM posts WHERE slug = ?`).get(candidate);
    if (!clash) return candidate;
    candidate = `${root.slice(0, 74)}-${suffix}`;
  }
  return `${root.slice(0, 66)}-${Date.now().toString(36)}`;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string" &&
    (error as { code: string }).code.startsWith("SQLITE_CONSTRAINT")
  );
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}
