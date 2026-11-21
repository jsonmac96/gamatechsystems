import { ImageResponse } from "next/og";

/**
 * Apple touch icon, generated at build time.
 *
 * Safari does not accept an SVG favicon for the home-screen icon, so this
 * renders a 180×180 PNG. Using the file convention means Next injects the
 * `<link rel="apple-touch-icon">` tag itself — no hand-written tag that could
 * point at a file that does not exist.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #22c9ee 0%, #06a9d4 55%, #0d6b90 100%)",
          color: "#ffffff",
          fontSize: 112,
          fontWeight: 800,
          fontFamily: "sans-serif",
          letterSpacing: "-0.04em",
        }}
      >
        G
      </div>
    ),
    size,
  );
}
