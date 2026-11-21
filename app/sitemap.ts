import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { PRODUCTS } from "@/lib/products";
import { SERVICES } from "@/lib/services";
import { listPublishedPosts } from "@/lib/posts";

/**
 * XML sitemap, generated from the routes and the database rather than
 * maintained by hand — so a new service or blog post cannot be forgotten.
 *
 * Only indexable, canonical URLs appear: the admin area and the API are
 * excluded, as are drafts (`listPublishedPosts` returns published rows only).
 */
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE.url}`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/products`, lastModified: now, changeFrequency: "monthly", priority: 0.95 },
    { url: `${SITE.url}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE.url}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const productPages: MetadataRoute.Sitemap = PRODUCTS.map((product) => ({
    url: `${SITE.url}/products/${product.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const servicePages: MetadataRoute.Sitemap = SERVICES.map((service) => ({
    url: `${SITE.url}/services/${service.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  let postPages: MetadataRoute.Sitemap = [];
  try {
    postPages = listPublishedPosts(500).map((post) => ({
      url: `${SITE.url}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // A sitemap must still be served if the database is briefly unavailable.
  }

  return [...staticPages, ...productPages, ...servicePages, ...postPages];
}
