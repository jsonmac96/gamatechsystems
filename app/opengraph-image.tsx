import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

/**
 * Default social sharing image, generated at build time.
 *
 * Produced as an image rather than shipped as a file so it stays in sync with
 * the brand tokens, needs no manual compression, and cannot go missing.
 */
export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #072f44 0%, #0d6b90 45%, #06a9d4 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Soft highlight */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -140,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background: "rgba(255,255,255,0.12)",
          }}
        />

        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 38,
              fontWeight: 800,
              color: "#06a9d4",
            }}
          >
            G
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#ffffff" }}>
            GamaTech Systems
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              maxWidth: 940,
            }}
          >
            Software and systems that run your business
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#cff8fe", maxWidth: 880 }}>
            Custom software, automation, web, SEO, AEO and marketing for Philippine SMEs.
          </div>
        </div>

        {/* Footer row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {["Software Development", "Systems Automation", "Web", "SEO & AEO"].map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                padding: "12px 22px",
                borderRadius: 9999,
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.28)",
                fontSize: 22,
                color: "#ffffff",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
