/**
 * GaMatech Systems brand assets.
 *
 * Recreated as inline SVG from the supplied brand artwork (the source PDFs are
 * raster, so the geometry here is redrawn rather than traced). Inline SVG costs
 * no request, stays crisp at any size and can take its colours from the
 * surrounding theme.
 *
 * The mark is a rounded "G" drawn as a single stroked polyline — the rounded
 * corners come from `stroke-linejoin="round"`, which at this stroke width
 * reproduces the artwork's corner radius exactly — plus a ring node at the top
 * right and the orange dot inside the counter.
 */

export type LogoTone = "navy" | "white" | "mono";

const TONES: Record<LogoTone, { mark: string; dot: string }> = {
  // Full colour on a light background.
  navy: { mark: "#0A1A3E", dot: "#E7580A" },
  // Reversed, for dark backgrounds.
  white: { mark: "#FFFFFF", dot: "#E7580A" },
  // One colour: inherits from `currentColor`, no orange.
  mono: { mark: "currentColor", dot: "currentColor" },
};

/** The "G" mark on its own. Decorative by default. */
export function LogoMark({
  className = "h-9 w-9",
  tone = "navy",
  title,
}: {
  className?: string;
  tone?: LogoTone;
  title?: string;
}) {
  const { mark, dot } = TONES[tone];

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {/* The G: top bar, left side, bottom, right side, then the crossbar. */}
      <path
        d="M78 14 L9 14 L9 88 L82 88 L82 55.5 L61 55.5"
        stroke={mark}
        strokeWidth="13.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Circuit node at the top right. */}
      <circle cx="85.5" cy="17" r="7" stroke={mark} strokeWidth="5.5" />
      {/* The accent dot sitting in the counter, at the end of the crossbar. */}
      <circle cx="50.5" cy="55.5" r="10.2" fill={dot} />
    </svg>
  );
}

/**
 * The mark inside a rounded tile, matching the supplied app-icon artwork.
 * `variant` mirrors the three icon treatments in the brand pack.
 */
export function LogoTile({
  className = "h-9 w-9",
  variant = "navy",
}: {
  className?: string;
  variant?: "navy" | "light" | "orange";
}) {
  const tile =
    variant === "navy" ? "#0A1A3E" : variant === "orange" ? "#E7580A" : "#FFFFFF";
  const stroke = variant === "light" ? "#0A1A3E" : "#FFFFFF";
  const dot = variant === "orange" ? "#0A1A3E" : "#E7580A";

  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true" focusable="false">
      <rect width="120" height="120" rx="30" fill={tile} />
      <g transform="translate(13 13) scale(0.94)">
        <path
          d="M78 14 L9 14 L9 88 L82 88 L82 55.5 L61 55.5"
          stroke={stroke}
          strokeWidth="13.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="85.5" cy="17" r="7" stroke={stroke} strokeWidth="5.5" />
        <circle cx="50.5" cy="55.5" r="10.2" fill={dot} />
      </g>
    </svg>
  );
}

/**
 * The full lockup: mark, "GaMatech" wordmark and the "SYSTEMS" descender.
 *
 * The wordmark is set in live text rather than outlines so it stays sharp at
 * every size, scales with the user's font settings and is selectable. The
 * weight contrast between "GaMa" and "tech" is part of the mark.
 */
export default function Logo({
  className = "",
  markClassName = "h-10 w-10",
  tone = "navy",
  wordClassName = "text-[1.3rem]",
  showSystems = true,
  stacked = false,
}: {
  className?: string;
  markClassName?: string;
  /** Size of the "GaMatech" wordmark; the SYSTEMS line scales with the mark. */
  wordClassName?: string;
  tone?: LogoTone;
  showSystems?: boolean;
  stacked?: boolean;
}) {
  const wordColor =
    tone === "white" ? "text-white" : tone === "mono" ? "text-current" : "text-brand-900";
  const systemsColor =
    tone === "white" ? "text-white/70" : tone === "mono" ? "text-current opacity-70" : "text-brand-500";

  return (
    <span
      className={`inline-flex ${stacked ? "flex-col items-center gap-2.5" : "items-center gap-2.5"} ${className}`}
    >
      <LogoMark className={markClassName} tone={tone} />
      <span className={`inline-flex flex-col ${stacked ? "items-center" : "items-start"} leading-none`}>
        <span className={`${wordClassName} tracking-tight ${wordColor}`}>
          <span className="font-extrabold">GaMa</span>
          <span className="font-light">tech</span>
        </span>
        {showSystems ? (
          <span
            className={`mt-1 text-[0.5rem] font-semibold uppercase leading-none tracking-[0.42em] ${systemsColor}`}
          >
            Systems
          </span>
        ) : null}
      </span>
    </span>
  );
}
