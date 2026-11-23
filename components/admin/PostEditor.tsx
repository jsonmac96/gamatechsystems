"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createPostAction, updatePostAction } from "@/app/actions/admin";
import { initialPostFormState } from "@/lib/form-state";
import type { Post } from "@/lib/posts";

/**
 * Blog post editor, shared by the "new" and "edit" screens.
 *
 * The slug field auto-fills from the title until the operator edits it by
 * hand, and the character counters mirror the SEO limits the server enforces.
 * All validation is re-run server-side in `validatePost`, so these counters
 * are guidance, not a security control.
 *
 * Markdown is stored as written and rendered by `lib/markdown.ts`, which
 * escapes the source before generating markup — so pasting raw HTML into the
 * body displays it as text rather than executing it.
 */
export default function PostEditor({ post }: { post?: Post }) {
  const isEdit = Boolean(post);
  const action = isEdit ? updatePostAction : createPostAction;
  const [state, formAction] = useActionState(action, initialPostFormState);

  const values = state.values ?? {};
  const err = state.errors;

  const initialTitle = values.title ?? post?.title ?? "";
  const initialSlug = values.slug ?? post?.slug ?? "";

  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [slugLocked, setSlugLocked] = useState(Boolean(initialSlug));
  const [metaDescription, setMetaDescription] = useState(
    values.metaDescription ?? post?.meta_description ?? "",
  );
  const [metaTitle, setMetaTitle] = useState(values.metaTitle ?? post?.meta_title ?? "");

  const onTitleChange = (next: string) => {
    setTitle(next);
    if (!slugLocked) setSlug(toSlug(next));
  };

  return (
    <form action={formAction} className="space-y-6">
      {isEdit && post ? <input type="hidden" name="id" value={post.id} /> : null}

      {state.error ? (
        <div
          role="alert"
          className="animate-fade-in rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
        >
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <div className="admin-card p-6">
            <div>
              <label htmlFor="title" className="field-label">
                Title <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                maxLength={140}
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                aria-invalid={err.title ? true : undefined}
                aria-describedby={err.title ? "title-error" : "title-hint"}
                className={`field ${err.title ? "field-error" : ""}`}
                placeholder="Why month-end close takes your team a week"
              />
              {err.title ? (
                <p id="title-error" className="error-text">
                  {err.title}
                </p>
              ) : (
                <p id="title-hint" className="field-hint">
                  {title.length}/140 characters. This becomes the page&rsquo;s single H1.
                </p>
              )}
            </div>

            <div className="mt-5">
              <label htmlFor="slug" className="field-label">
                URL slug
              </label>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-sm text-ink-500 dark:text-ink-400">/blog/</span>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  maxLength={80}
                  value={slug}
                  onChange={(event) => {
                    setSlugLocked(true);
                    setSlug(event.target.value);
                  }}
                  aria-invalid={err.slug ? true : undefined}
                  aria-describedby={err.slug ? "slug-error" : "slug-hint"}
                  className={`field font-mono text-sm ${err.slug ? "field-error" : ""}`}
                  placeholder="month-end-close-takes-a-week"
                />
              </div>
              {err.slug ? (
                <p id="slug-error" className="error-text">
                  {err.slug}
                </p>
              ) : (
                <p id="slug-hint" className="field-hint">
                  Lowercase letters, numbers and hyphens. Changing this after publishing breaks
                  existing links, so set it once.
                </p>
              )}
            </div>

            <div className="mt-5">
              <label htmlFor="excerpt" className="field-label">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={3}
                maxLength={300}
                defaultValue={values.excerpt ?? post?.excerpt ?? ""}
                aria-invalid={err.excerpt ? true : undefined}
                className={`field resize-y ${err.excerpt ? "field-error" : ""}`}
                placeholder="One or two sentences shown on the blog index and used as the fallback meta description."
              />
              {err.excerpt ? (
                <p className="error-text">{err.excerpt}</p>
              ) : (
                <p className="field-hint">
                  Leave blank and we will take the opening of the article.
                </p>
              )}
            </div>
          </div>

          <div className="admin-card p-6">
            <label htmlFor="bodyMd" className="field-label">
              Article body <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <p className="field-hint mb-2">
              Markdown: <code>## Heading</code>, <code>**bold**</code>, <code>*italic*</code>,{" "}
              <code>- bullet</code>, <code>1. numbered</code>, <code>&gt; quote</code>,{" "}
              <code>[link](/path)</code>, <code>`code`</code> and fenced code blocks. Raw HTML is
              shown as text, not rendered.
            </p>
            <textarea
              id="bodyMd"
              name="bodyMd"
              rows={24}
              required
              maxLength={60000}
              defaultValue={values.bodyMd ?? post?.body_md ?? ""}
              aria-invalid={err.bodyMd ? true : undefined}
              className={`field resize-y font-mono text-sm leading-relaxed ${err.bodyMd ? "field-error" : ""}`}
              placeholder={"Most distributors we meet close the month in seven days.\n\n## Where the week actually goes\n\nThe time is not in the accounting. It is in reconciling three systems that disagree..."}
            />
            {err.bodyMd ? <p className="error-text">{err.bodyMd}</p> : null}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="admin-card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Publish
            </h2>

            <div className="mt-4">
              <label htmlFor="status" className="field-label">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={values.status ?? post?.status ?? "draft"}
                className="field"
              >
                <option value="draft">Draft — not visible publicly</option>
                <option value="published">Published — live on the site</option>
              </select>
              <p className="field-hint">
                A draft is unreachable even by direct URL.
              </p>
            </div>

            <div className="mt-5">
              <label htmlFor="authorName" className="field-label">
                Author
              </label>
              <input
                id="authorName"
                name="authorName"
                type="text"
                maxLength={80}
                defaultValue={values.authorName ?? post?.author_name ?? "GaMatech Systems"}
                className="field"
              />
            </div>

            <div className="mt-5">
              <label htmlFor="tags" className="field-label">
                Tags
              </label>
              <input
                id="tags"
                name="tags"
                type="text"
                maxLength={160}
                defaultValue={values.tags ?? post?.tags ?? ""}
                className="field"
                placeholder="automation, reporting, SME"
              />
              <p className="field-hint">Comma separated, up to 8.</p>
            </div>

            <div className="mt-6 space-y-2.5">
              <SaveButton isEdit={isEdit} />
              <Link href="/admin/posts" className="btn-secondary w-full justify-center text-sm">
                Cancel
              </Link>
            </div>
          </div>

          <div className="admin-card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Search appearance
            </h2>
            <p className="field-hint mt-2">
              Leave these blank to use the title and excerpt.
            </p>

            <div className="mt-4">
              <label htmlFor="metaTitle" className="field-label">
                Meta title
              </label>
              <input
                id="metaTitle"
                name="metaTitle"
                type="text"
                maxLength={70}
                value={metaTitle}
                onChange={(event) => setMetaTitle(event.target.value)}
                className="field"
              />
              <p className={`field-hint ${metaTitle.length > 60 ? "text-accent-600" : ""}`}>
                {metaTitle.length}/60 recommended
              </p>
            </div>

            <div className="mt-5">
              <label htmlFor="metaDescription" className="field-label">
                Meta description
              </label>
              <textarea
                id="metaDescription"
                name="metaDescription"
                rows={3}
                maxLength={165}
                value={metaDescription}
                onChange={(event) => setMetaDescription(event.target.value)}
                aria-invalid={err.metaDescription ? true : undefined}
                className={`field resize-y ${err.metaDescription ? "field-error" : ""}`}
              />
              {err.metaDescription ? (
                <p className="error-text">{err.metaDescription}</p>
              ) : (
                <p
                  className={`field-hint ${
                    metaDescription.length > 0 && (metaDescription.length < 50 || metaDescription.length > 160)
                      ? "text-accent-600"
                      : ""
                  }`}
                >
                  {metaDescription.length}/160 — aim for 50–160
                </p>
              )}
            </div>

            <div className="mt-5">
              <label htmlFor="coverAlt" className="field-label">
                Cover image description
              </label>
              <input
                id="coverAlt"
                name="coverAlt"
                type="text"
                maxLength={160}
                defaultValue={values.coverAlt ?? post?.cover_alt ?? ""}
                className="field"
                placeholder="Warehouse staff checking stock on a tablet"
              />
              <p className="field-hint">
                Alt text for the generated cover graphic. Describe it for someone who cannot see
                it.
              </p>
            </div>
          </div>

          {/* Live search-result preview */}
          <div className="admin-card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Preview
            </h2>
            <div className="mt-4 rounded-xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-950/50">
              <p className="truncate text-xs text-ink-500 dark:text-ink-400">
                gamatechsystems.com › blog › {slug || "your-slug"}
              </p>
              <p className="mt-1 line-clamp-2 text-base font-medium text-blue-700 dark:text-blue-400">
                {metaTitle || title || "Your post title"}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-ink-600 dark:text-ink-300">
                {metaDescription || "Your meta description will appear here."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function SaveButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-3 text-sm font-bold text-white shadow-glow transition-all duration-200 enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Saving…
        </>
      ) : isEdit ? (
        "Save changes"
      ) : (
        "Create post"
      )}
    </button>
  );
}

/** Mirror of `slugify` in lib/validate.ts, for the live preview only. */
function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’"“”]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}
