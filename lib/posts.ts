import "server-only";
import { audit, execute, now, query, queryOne } from "@/lib/db";
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
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

/**
 * The column list, interpolated into the SELECT statements below.
 *
 * This is a module constant, not request input — the only values that ever
 * reach a query are bound as parameters.
 */
const SELECT_COLUMNS = `id, slug, title, excerpt, body_md, cover_alt, tags,
  meta_title, meta_description, status, author_name, published_at, created_at, updated_at`;

export type CreateResult =
  | { ok: true; id: number; slug: string }
  | { ok: false; message: string; field?: string };

export async function createPost(
  input: PostInput,
  userId: number,
  actor: string,
): Promise<CreateResult> {
  const slug = await ensureUniqueSlug(input.slug);
  const timestamp = now();
  const publishedAt = input.status === "published" ? timestamp : null;

  try {
    const row = await queryOne<{ id: number }>(
      `INSERT INTO posts
         (slug, title, excerpt, body_md, cover_alt, tags, meta_title, meta_description,
          status, author_name, published_at, created_at, updated_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id`,
      [
        slug,
        input.title,
        input.excerpt || toPlainText(input.bodyMd, 200),
        input.bodyMd,
        input.coverAlt,
        input.tags,
        input.metaTitle,
        input.metaDescription,
        input.status,
        input.authorName,
        publishedAt,
        timestamp,
        timestamp,
        userId,
      ],
    );

    const id = row?.id ?? 0;
    await audit({ actor, action: "post.created", target: `post:${id}`, detail: `${input.status} ${slug}` });
    return { ok: true, id, slug };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, field: "slug", message: "That URL slug is already in use." };
    }
    throw error;
  }
}

export type UpdateResult =
  | { ok: true; slug: string }
  | { ok: false; message: string; field?: string };

export async function updatePost(
  id: number,
  input: PostInput,
  actor: string,
): Promise<UpdateResult> {
  if (!Number.isInteger(id) || id <= 0) return { ok: false, message: "Unknown post." };

  const existing = await queryOne<Pick<Post, "id" | "slug" | "status" | "published_at">>(
    `SELECT id, slug, status, published_at FROM posts WHERE id = $1`,
    [id],
  );
  if (!existing) return { ok: false, message: "That post no longer exists." };

  const slug = input.slug === existing.slug ? existing.slug : await ensureUniqueSlug(input.slug, id);

  // Keep the original publication date when re-saving an already published
  // post; stamp it the first time a draft goes live.
  const publishedAt =
    input.status === "published" ? (existing.published_at ?? now()) : null;

  try {
    await execute(
      `UPDATE posts SET
         slug = $1, title = $2, excerpt = $3, body_md = $4,
         cover_alt = $5, tags = $6, meta_title = $7,
         meta_description = $8, status = $9,
         author_name = $10, published_at = $11, updated_at = $12
       WHERE id = $13`,
      [
        slug,
        input.title,
        input.excerpt || toPlainText(input.bodyMd, 200),
        input.bodyMd,
        input.coverAlt,
        input.tags,
        input.metaTitle,
        input.metaDescription,
        input.status,
        input.authorName,
        publishedAt,
        now(),
        id,
      ],
    );

    await audit({ actor, action: "post.updated", target: `post:${id}`, detail: `${input.status} ${slug}` });
    return { ok: true, slug };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, field: "slug", message: "That URL slug is already in use." };
    }
    throw error;
  }
}

export async function deletePost(id: number, actor: string): Promise<boolean> {
  if (!Number.isInteger(id) || id <= 0) return false;
  const changed = await execute(`DELETE FROM posts WHERE id = $1`, [id]);
  if (changed > 0) {
    await audit({ actor, action: "post.deleted", target: `post:${id}` });
  }
  return changed > 0;
}

export async function setPostStatus(
  id: number,
  status: PostStatus,
  actor: string,
): Promise<boolean> {
  if (!Number.isInteger(id) || id <= 0) return false;
  if (status !== "draft" && status !== "published") return false;

  const existing = await queryOne<{ published_at: Date | null }>(
    `SELECT published_at FROM posts WHERE id = $1`,
    [id],
  );
  if (!existing) return false;

  const publishedAt = status === "published" ? (existing.published_at ?? now()) : null;
  const changed = await execute(
    `UPDATE posts SET status = $1, published_at = $2, updated_at = $3 WHERE id = $4`,
    [status, publishedAt, now(), id],
  );

  if (changed > 0) {
    await audit({ actor, action: "post.status_changed", target: `post:${id}`, detail: status });
  }
  return changed > 0;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** Published posts only — the public blog listing. */
export async function listPublishedPosts(limit = 50, offset = 0): Promise<Post[]> {
  return query<Post>(
    `SELECT ${SELECT_COLUMNS} FROM posts
      WHERE status = 'published' AND published_at IS NOT NULL
      ORDER BY published_at DESC
      LIMIT $1 OFFSET $2`,
    [clamp(limit, 1, 200), clamp(offset, 0, 100_000)],
  );
}

export async function countPublishedPosts(): Promise<number> {
  const row = await queryOne<{ n: number }>(
    `SELECT COUNT(*)::bigint AS n FROM posts WHERE status = 'published'`,
  );
  return row?.n ?? 0;
}

/** Every post regardless of status — admin listing only. */
export async function listAllPosts(limit = 100, offset = 0): Promise<Post[]> {
  return query<Post>(
    `SELECT ${SELECT_COLUMNS} FROM posts
      ORDER BY (status = 'draft') DESC, COALESCE(published_at, created_at) DESC
      LIMIT $1 OFFSET $2`,
    [clamp(limit, 1, 500), clamp(offset, 0, 100_000)],
  );
}

/**
 * Fetch a post by slug.
 *
 * `includeDrafts` defaults to false so a public route can never leak an
 * unpublished draft by guessing its URL.
 */
export async function getPostBySlug(
  slug: string,
  includeDrafts = false,
): Promise<Post | undefined> {
  if (!isValidSlug(slug)) return undefined;
  const sql = includeDrafts
    ? `SELECT ${SELECT_COLUMNS} FROM posts WHERE slug = $1`
    : `SELECT ${SELECT_COLUMNS} FROM posts WHERE slug = $1 AND status = 'published'`;
  return queryOne<Post>(sql, [slug]);
}

export async function getPostById(id: number): Promise<Post | undefined> {
  if (!Number.isInteger(id) || id <= 0) return undefined;
  return queryOne<Post>(`SELECT ${SELECT_COLUMNS} FROM posts WHERE id = $1`, [id]);
}

/** Other published posts, for "keep reading" links (good for internal linking). */
export async function relatedPosts(excludeId: number, limit = 3): Promise<Post[]> {
  return query<Post>(
    `SELECT ${SELECT_COLUMNS} FROM posts
      WHERE status = 'published' AND id <> $1
      ORDER BY published_at DESC LIMIT $2`,
    [Number.isInteger(excludeId) ? excludeId : 0, clamp(limit, 1, 12)],
  );
}

export async function postStats(): Promise<{
  total: number;
  published: number;
  drafts: number;
}> {
  const row = await queryOne<{ total: number; published: number }>(
    `SELECT COUNT(*)::bigint AS total,
            COUNT(*) FILTER (WHERE status = 'published')::bigint AS published
       FROM posts`,
  );
  const total = row?.total ?? 0;
  const published = row?.published ?? 0;
  return { total, published, drafts: total - published };
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
async function ensureUniqueSlug(base: string, excludeId?: number): Promise<string> {
  const root = isValidSlug(base) ? base : "post";
  let candidate = root;

  for (let suffix = 2; suffix < 200; suffix += 1) {
    const clash = excludeId
      ? await queryOne(`SELECT 1 FROM posts WHERE slug = $1 AND id <> $2`, [candidate, excludeId])
      : await queryOne(`SELECT 1 FROM posts WHERE slug = $1`, [candidate]);
    if (!clash) return candidate;
    candidate = `${root.slice(0, 74)}-${suffix}`;
  }
  return `${root.slice(0, 66)}-${Date.now().toString(36)}`;
}

/** PostgreSQL reports a unique-constraint breach as SQLSTATE 23505. */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "23505"
  );
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}
