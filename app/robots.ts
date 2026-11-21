import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * robots.txt
 *
 * Search and answer engines are welcomed to the public site and kept out of
 * the admin area and the API. Note that `Disallow` is a crawling instruction,
 * not an access control — the admin area is additionally protected by session
 * authentication and a `noindex` header.
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/admin/", "/api/"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      {
        // Answer engines: explicitly welcome, since being cited by them is the
        // point of the AEO work on this site.
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "PerplexityBot",
          "Perplexity-User",
          "ClaudeBot",
          "Claude-User",
          "Claude-SearchBot",
          "Google-Extended",
          "Applebot-Extended",
          "Bingbot",
          "CCBot",
          "cohere-ai",
          "meta-externalagent",
        ],
        allow: "/",
        disallow,
      },
      {
        // Aggressive SEO scrapers that offer nothing in return.
        userAgent: ["AhrefsBot", "SemrushBot", "DotBot", "MJ12bot", "PetalBot"],
        disallow: "/",
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
