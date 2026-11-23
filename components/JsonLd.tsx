import { headers } from "next/headers";
import { jsonLdString } from "@/lib/seo";

/**
 * Emit structured data as an inline `application/ld+json` script.
 *
 * The CSP set in `proxy.ts` has no `unsafe-inline`, so the nonce issued for
 * this request is attached here. The payload itself is escaped by
 * `jsonLdString`, which neutralises `<`, `>` and `&` so no value can break out
 * of the script element.
 */
export default async function JsonLd({ data }: { data: unknown | unknown[] }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const items = Array.isArray(data) ? data : [data];

  return (
    <>
      {items.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          nonce={nonce}
          // Safe: `jsonLdString` serialises and escapes; no user HTML reaches here.
          dangerouslySetInnerHTML={{ __html: jsonLdString(item) }}
        />
      ))}
    </>
  );
}
