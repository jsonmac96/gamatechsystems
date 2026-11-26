import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";
import { LOGO_WHITE_DATA_URL as LOGO_WHITE } from "@/lib/og-logo";

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
          background: "linear-gradient(135deg, #06112A 0%, #0A1A3E 55%, #1B2C57 100%)",
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

        {/* Brand row: the white logo, embedded in lib/og-logo.ts. */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img */}
          <img src={LOGO_WHITE} width={330} height={101} alt="" />
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
            Business systems built your way, and built to grow
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#C2D0EC", maxWidth: 880 }}>
POS, ERP, payroll, service desk and CRM for growing businesses worldwide.
          </div>
        </div>

        {/* Footer row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {["Restaurant & Retail POS", "ERP", "Payroll & HRIS", "CRM"].map((tag) => (
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
