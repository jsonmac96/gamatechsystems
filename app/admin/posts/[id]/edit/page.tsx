import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { getPostById } from "@/lib/posts";
import PostEditor from "@/components/admin/PostEditor";

export const metadata: Metadata = {
  title: "Edit post",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Only a positive integer is a valid post id; anything else is a 404. */
function parseId(raw: string): number | null {
  if (!/^\d{1,10}$/.test(raw)) return null;
  const id = Number.parseInt(raw, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession("/admin/posts");

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) notFound();

  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb">
        <Link
          href="/admin/posts"
          className="text-sm font-semibold text-ink-500 transition-colors hover:text-brand-700 dark:text-ink-400 dark:hover:text-brand-300"
        >
          &larr; Back to all posts
        </Link>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl dark:text-white">
            Edit post
          </h1>
          <p className="mt-1.5 font-mono text-sm text-ink-500 dark:text-ink-400">/blog/{post.slug}</p>
        </div>

        {post.status === "published" ? (
          <Link href={`/blog/${post.slug}`} className="btn-secondary text-sm">
            View live page
          </Link>
        ) : (
          <span className="badge bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300">
            Draft — not public
          </span>
        )}
      </div>

      <PostEditor post={post} />
    </div>
  );
}
