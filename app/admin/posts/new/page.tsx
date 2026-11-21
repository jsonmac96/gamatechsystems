import Link from "next/link";
import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import PostEditor from "@/components/admin/PostEditor";

export const metadata: Metadata = {
  title: "New post",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  // Authorisation enforced here, not by the layout.
  await requireSession("/admin/posts/new");

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

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl dark:text-white">
          New post
        </h1>
        <p className="mt-1.5 text-ink-600 dark:text-ink-300">
          Save it as a draft while you work. Nothing is public until you publish.
        </p>
      </div>

      <PostEditor />
    </div>
  );
}
