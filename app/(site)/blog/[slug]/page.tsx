import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import {
  articleSchema,
  breadcrumbSchema,
  pageMetadata,
} from "@/lib/seo";
import {
  getPostBySlug,
  postMetaDescription,
  postMetaTitle,
  postReadingTime,
  postTags,
  relatedPosts,
} from "@/lib/posts";
import { extractHeadings, renderMarkdown, toPlainText } from "@/lib/markdown";
import { isValidSlug } from "@/lib/validate";
import { iso } from "@/lib/db";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBand from "@/components/CtaBand";

type Params = { slug: string };

/**
 * Rendered per request.
 *
 * This route cannot be prerendered: the CSP in `proxy.ts` issues a fresh
 * nonce per request, and the components that consume it (the JSON-LD block and
 * the reveal bootstrap in the root layout) read `headers()`. Attempting to
 * statically prerender this page therefore throws DYNAMIC_SERVER_USAGE and
 * silently drops the structured data — which is exactly the opposite of what a
 * blog post needs.
 *
 * The cost is negligible here: the only I/O is a single indexed SQLite read on
 * the same machine, so time-to-first-byte stays in single-digit milliseconds.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return { title: "Article not found", robots: { index: false, follow: false } };
  }

  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "Article not found", robots: { index: false, follow: false } };
  }

  return pageMetadata({
    title: postMetaTitle(post),
    description: postMetaDescription(post),
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: iso(post.published_at ?? post.created_at),
    modifiedTime: iso(post.updated_at),
    authors: [post.author_name],
    keywords: postTags(post),
  });
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  // Reject a malformed slug before it reaches the database.
  if (!isValidSlug(slug)) notFound();

  // `getPostBySlug` defaults to published-only, so a draft URL 404s for the public.
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const html = renderMarkdown(post.body_md);
  const headings = extractHeadings(post.body_md);
  const related = await relatedPosts(post.id, 3);
  const published = iso(post.published_at ?? post.created_at);
  const tags = postTags(post);
  const wordCount = toPlainText(post.body_md, 200_000).split(/\s+/).filter(Boolean).length;

  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            title: post.title,
            description: postMetaDescription(post),
            slug: post.slug,
            publishedAt: published,
            updatedAt: iso(post.updated_at),
            author: post.author_name,
            tags,
            wordCount,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Insights", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />

      <article>
        {/* Header */}
        <header className="relative overflow-hidden py-14 sm:py-16">
          <div aria-hidden="true" className="parallax-bg pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-50/70 to-white dark:from-ink-900 dark:to-ink-950" />
            <div className="blob left-[-8rem] top-[-7rem] h-72 w-72 animate-drift bg-brand-300/30 dark:bg-brand-800/25" />
          </div>

          <div className="container-page">
            <Breadcrumbs
              trail={[
                { name: "Home", href: "/" },
                { name: "Insights", href: "/blog" },
                { name: post.title },
              ]}
            />

            <div className="mx-auto mt-8 max-w-3xl">
              <Reveal>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-brand-600 dark:text-brand-300">
                  <time dateTime={published}>
                    {new Date(published).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      timeZone: "Asia/Manila",
                    })}
                  </time>
                  <span aria-hidden="true" className="text-ink-300 dark:text-ink-600">·</span>
                  <span className="text-ink-500 dark:text-ink-400">
                    {postReadingTime(post)} min read
                  </span>
                  <span aria-hidden="true" className="text-ink-300 dark:text-ink-600">·</span>
                  <span className="text-ink-500 dark:text-ink-400">{post.author_name}</span>
                </div>

                {/* The post title is this page's single H1. */}
                <h1 className="h1 mt-5">{post.title}</h1>

                {post.excerpt ? <p className="lede mt-6">{post.excerpt}</p> : null}

                {tags.length > 0 ? (
                  <ul className="mt-7 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Reveal>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="container-page pb-16">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12">
            {/* Table of contents */}
            {headings.length >= 3 ? (
              <aside className="lg:col-span-3 lg:order-2" aria-labelledby="toc-heading">
                <div className="lg:sticky lg:top-28">
                  <h2 id="toc-heading" className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500 dark:text-ink-400">
                    On this page
                  </h2>
                  <nav className="mt-4">
                    <ul className="space-y-2.5 border-l border-ink-200 pl-4 dark:border-ink-800">
                      {headings.map((heading) => (
                        <li key={heading.id}>
                          <a
                            href={`#${heading.id}`}
                            className="block text-sm leading-snug text-ink-600 transition-colors hover:text-brand-700 dark:text-ink-300 dark:hover:text-brand-300"
                          >
                            {heading.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </aside>
            ) : null}

            <div
              className={
                "min-w-0 " +
                (headings.length >= 3 ? "lg:col-span-9 lg:order-1" : "lg:col-span-12")
              }
            >
              <div className="mx-auto min-w-0 max-w-3xl">
                {/*
                  Safe: `renderMarkdown` HTML-escapes the entire source before
                  generating markup, and emits only its own allow-listed tags
                  and attributes. See lib/markdown.ts.
                */}
                <div
                  data-reveal-children
                  className="break-words text-[1.0625rem]"
                  dangerouslySetInnerHTML={{ __html: html }}
                />

                {/* Inline CTA at the end of the article */}
                <div className="mt-14 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white shadow-glow sm:p-10">
                  <h2 className="text-2xl font-bold">Think this applies to your business?</h2>
                  <p className="mt-3 max-w-xl text-brand-50">
                    Tell us what your current process looks like. We will come back within one
                    business day with a straight answer about what we would change first.
                  </p>
                  <Link
                    href="/contact"
                    className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-bold text-brand-800 transition-all hover:-translate-y-0.5 hover:shadow-lift"
                  >
                    Get your free consultation
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M3 10a1 1 0 0 1 1-1h9.6l-3.3-3.3a1 1 0 0 1 1.4-1.4l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L13.6 11H4a1 1 0 0 1-1-1Z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related — internal linking */}
        {related.length > 0 ? (
          <section aria-labelledby="related-heading" className="border-t border-ink-200 py-16 dark:border-ink-800">
            <div className="container-page">
              <h2 id="related-heading" className="h3">
                Keep reading
              </h2>
              <ul className="mt-8 grid gap-6 md:grid-cols-3">
                {related.map((item, index) => (
                  <Reveal as="li" key={item.id} delay={index * 80}>
                    <Link href={`/blog/${item.slug}`} className="card-interactive group flex h-full flex-col">
                      <time
                        dateTime={iso(item.published_at ?? item.created_at)}
                        className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300"
                      >
                        {new Date(item.published_at ?? item.created_at).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          timeZone: "Asia/Manila",
                        })}
                      </time>
                      <h3 className="mt-3 text-base font-bold leading-snug text-ink-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
                        {item.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm text-ink-600 dark:text-ink-300">
                        {item.excerpt}
                      </p>
                    </Link>
                  </Reveal>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </article>

      <CtaBand />
    </>
  );
}
