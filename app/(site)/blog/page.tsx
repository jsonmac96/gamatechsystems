import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import {
  listPublishedPosts,
  postReadingTime,
  postTags,
  type Post,
} from "@/lib/posts";
import { iso } from "@/lib/db";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = pageMetadata({
  title: "Insights for Philippine SMEs",
  description:
    "Practical articles on custom software, business process automation, web performance, SEO and AEO, written for owners and operations leads of Philippine SMEs.",
  path: "/blog",
  keywords: ["software blog Philippines", "SME automation insights", "SEO AEO articles Philippines"],
});

/**
 * Rendered per request — see the note in `blog/[slug]/page.tsx`. The root
 * layout reads `headers()` for the CSP nonce, so no page under it can be
 * statically prerendered.
 */
export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  // Falls back to the empty state rather than an error page if the database
  // is briefly unreachable.
  const posts = await listPublishedPosts(60).catch(() => []);
  const [featured, ...rest] = posts;

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE.url}/blog#blog`,
    name: `${SITE.name} Insights`,
    url: `${SITE.url}/blog`,
    description:
      "Practical articles on custom software, automation, web performance, SEO and AEO for Philippine SMEs.",
    inLanguage: SITE.language,
    publisher: { "@id": `${SITE.url}/#organization` },
    blogPost: posts.slice(0, 20).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${SITE.url}/blog/${post.slug}`,
      datePublished: iso(post.published_at ?? post.created_at),
      dateModified: iso(post.updated_at),
      author: { "@type": "Organization", name: post.author_name },
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          blogSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Insights", path: "/blog" },
          ]),
        ]}
      />

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50/70 to-white dark:from-ink-900 dark:to-ink-950" />
          <div className="blob right-[-8rem] top-[-6rem] h-80 w-80 animate-drift bg-brand-300/35 dark:bg-brand-800/25" />
        </div>

        <div className="container-page">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Insights" }]} />

          <Reveal className="mt-8 max-w-3xl">
            <span className="eyebrow">Insights</span>
            <h1 className="h1 mt-5">
              Practical writing for owners who have to make the call
            </h1>
            <p className="lede mt-6">
              No listicles, no vendor talking points. Notes from actual projects — what the work
              cost, what it saved, and what we would do differently.
            </p>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="articles-heading" className="pb-20 sm:pb-24">
        <h2 id="articles-heading" className="sr-only">
          Articles
        </h2>
        <div className="container-page">
          {posts.length === 0 ? (
            <Reveal>
              <div className="rounded-3xl border border-dashed border-ink-300 bg-ink-50/60 p-12 text-center dark:border-ink-700 dark:bg-ink-900/40">
                <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5.5 4.5h9l4 4v11h-13Z" />
                    <path d="M14.5 4.5v4h4M8.5 13h7M8.5 16h4" />
                  </svg>
                </span>
                <h3 className="mt-5 text-xl font-bold text-ink-900 dark:text-white">
                  The first articles are on their way
                </h3>
                <p className="mx-auto mt-3 max-w-md text-ink-600 dark:text-ink-300">
                  We are writing up recent projects now. In the meantime, the service pages go
                  into detail on how each engagement runs.
                </p>
                <Link href="/services" className="btn-secondary mt-7">
                  Browse our services
                </Link>
              </div>
            </Reveal>
          ) : (
            <>
              {/* Featured post */}
              {featured ? (
                <Reveal>
                  <Link
                    href={`/blog/${featured.slug}`}
                    className="group block overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift dark:border-ink-800 dark:bg-ink-900/60 dark:hover:border-brand-700"
                  >
                    <div className="grid lg:grid-cols-2">
                      {/* Decorative generated cover — no image file to break or compress */}
                      <div
                        className="relative hidden min-h-[16rem] overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-ink-900 lg:block"
                        role="img"
                        aria-label={featured.cover_alt || `Illustration for: ${featured.title}`}
                      >
                        <span aria-hidden="true" className="absolute inset-0 opacity-20 grid-backdrop" />
                        <span aria-hidden="true" className="blob left-[-3rem] top-[-3rem] h-56 w-56 animate-drift bg-brand-400/40" />
                        <span className="absolute bottom-7 left-7 right-7 text-sm font-semibold uppercase tracking-[0.16em] text-brand-100">
                          Featured
                        </span>
                      </div>

                      <div className="p-8 sm:p-10">
                        <PostMeta post={featured} />
                        <h3 className="mt-4 text-2xl font-bold leading-tight text-ink-900 group-hover:text-brand-700 sm:text-3xl dark:text-white dark:group-hover:text-brand-300">
                          {featured.title}
                        </h3>
                        <p className="mt-4 prose-body">{featured.excerpt}</p>
                        <span className="btn-ghost mt-6">
                          Read the article
                          <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M3 10a1 1 0 0 1 1-1h9.6l-3.3-3.3a1 1 0 0 1 1.4-1.4l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L13.6 11H4a1 1 0 0 1-1-1Z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ) : null}

              {rest.length > 0 ? (
                <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post, index) => (
                    <Reveal as="li" key={post.id} delay={index * 70}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="card-interactive group flex h-full flex-col"
                      >
                        <PostMeta post={post} />
                        <h3 className="mt-3 text-lg font-bold leading-snug text-ink-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
                          {post.title}
                        </h3>
                        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                          {post.excerpt}
                        </p>
                        {postTags(post).length > 0 ? (
                          <ul className="mt-5 flex flex-wrap gap-2">
                            {postTags(post).slice(0, 3).map((tag) => (
                              <li
                                key={tag}
                                className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-600 dark:bg-ink-800 dark:text-ink-300"
                              >
                                {tag}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </Link>
                    </Reveal>
                  ))}
                </ul>
              ) : null}
            </>
          )}
        </div>
      </section>

      <CtaBand
        heading="Want this applied to your business?"
        sub="Reading about it is one thing. Tell us your situation and we will tell you what we would actually do."
      />
    </>
  );
}

function PostMeta({ post }: { post: Post }) {
  const published = iso(post.published_at ?? post.created_at);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
      <time dateTime={published}>
        {new Date(published).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "Asia/Manila",
        })}
      </time>
      <span aria-hidden="true" className="text-ink-300 dark:text-ink-600">
        ·
      </span>
      <span className="text-ink-500 dark:text-ink-400">{postReadingTime(post)} min read</span>
    </div>
  );
}
