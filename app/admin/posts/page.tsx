import Link from "next/link";
import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { listAllPosts, postReadingTime, postStats } from "@/lib/posts";
import { deletePostAction, setPostStatusAction } from "@/app/actions/admin";

export const metadata: Metadata = {
  title: "Blog posts",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireSession("/admin/posts");

  const params = await searchParams;
  const justCreated = params.created === "1";
  const justSaved = params.saved === "1";

  const posts = listAllPosts(200);
  const stats = postStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl dark:text-white">
            Blog
          </h1>
          <p className="mt-1.5 text-ink-600 dark:text-ink-300">
            {stats.published} published · {stats.drafts} draft{stats.drafts === 1 ? "" : "s"}
          </p>
        </div>

        <Link href="/admin/posts/new" className="btn-cta px-6 py-3.5 text-base">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 0 1 0 2h-5v5a1 1 0 0 1-2 0v-5H4a1 1 0 0 1 0-2h5V4a1 1 0 0 1 1-1Z" />
          </svg>
          New post
        </Link>
      </div>

      {justCreated || justSaved ? (
        <div
          role="status"
          className="animate-fade-in rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200"
        >
          {justCreated ? "Post created." : "Changes saved."} The public blog has been refreshed.
        </div>
      ) : null}

      {posts.length === 0 ? (
        <div className="admin-card px-6 py-16 text-center">
          <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5.5 4.5h9l4 4v11h-13Z" />
              <path d="M14.5 4.5v4h4M8.5 13h7M8.5 16h4" />
            </svg>
          </span>
          <h2 className="mt-5 text-lg font-semibold text-ink-900 dark:text-white">No posts yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500 dark:text-ink-400">
            Write your first article. Drafts stay private until you publish them.
          </p>
          <Link href="/admin/posts/new" className="btn-cta mt-7">
            Write the first post
          </Link>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem]">
              <caption className="sr-only">All blog posts, newest first, drafts at the top</caption>
              <thead className="border-b border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-950/50">
                <tr>
                  <th scope="col" className="table-head">Title</th>
                  <th scope="col" className="table-head">Status</th>
                  <th scope="col" className="table-head">Updated</th>
                  <th scope="col" className="table-head">Length</th>
                  <th scope="col" className="table-head text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200 dark:divide-ink-800">
                {posts.map((post) => (
                  <tr key={post.id} className="transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/40">
                    <td className="table-cell">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="font-semibold text-ink-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-300"
                      >
                        {post.title}
                      </Link>
                      <span className="mt-0.5 block font-mono text-xs text-ink-400 dark:text-ink-500">
                        /blog/{post.slug}
                      </span>
                    </td>

                    <td className="table-cell">
                      <span
                        className={`badge ${
                          post.status === "published"
                            ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                            : "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>

                    <td className="table-cell whitespace-nowrap text-ink-500 dark:text-ink-400">
                      <time dateTime={post.updated_at}>
                        {new Date(post.updated_at).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          timeZone: "Asia/Manila",
                        })}
                      </time>
                    </td>

                    <td className="table-cell whitespace-nowrap text-ink-500 dark:text-ink-400">
                      {postReadingTime(post)} min
                    </td>

                    <td className="table-cell">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {post.status === "published" ? (
                          <Link
                            href={`/blog/${post.slug}`}
                            className="rounded-lg border border-ink-300 px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:border-brand-400 hover:text-brand-700 dark:border-ink-700 dark:text-ink-200"
                          >
                            View
                          </Link>
                        ) : null}

                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="rounded-lg border border-ink-300 px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:border-brand-400 hover:text-brand-700 dark:border-ink-700 dark:text-ink-200"
                        >
                          Edit
                        </Link>

                        <form action={setPostStatusAction}>
                          <input type="hidden" name="id" value={post.id} />
                          <input
                            type="hidden"
                            name="status"
                            value={post.status === "published" ? "draft" : "published"}
                          />
                          <button
                            type="submit"
                            className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600 dark:bg-brand-500 dark:text-ink-950 dark:hover:bg-brand-400"
                          >
                            {post.status === "published" ? "Unpublish" : "Publish"}
                          </button>
                        </form>

                        <form action={deletePostAction}>
                          <input type="hidden" name="id" value={post.id} />
                          <button
                            type="submit"
                            aria-label={`Delete post: ${post.title}`}
                            className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
