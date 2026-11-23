/**
 * GaMatech Systems brand assets.
 *
 * The images in `public/brand/` are cut from the supplied logo artwork with
 * the white background made transparent:
 *
 *   logo.png        the full lockup: shield mark, "GaMatech" and "SYSTEMS"
 *   logo-white.png  the same, with the navy reversed to white for dark grounds
 *   mark.png        the shield mark on its own
 *
 * The artwork was supplied as a raster image, so these are PNGs at the
 * resolution it came in. Replacing them with a vector (SVG) export of the
 * logo, at the same paths and proportions, would make them sharper on large
 * and high-density screens without touching any page.
 */

export type LogoTone = "navy" | "white";

const LOCKUP = {
  navy: "/brand/logo.png",
  white: "/brand/logo-white.png",
} as const;

/** Intrinsic sizes, so the browser reserves the space before the image loads. */
const LOCKUP_SIZE = { width: 493, height: 151 } as const;
const MARK_SIZE = { width: 140, height: 151 } as const;

/** The shield mark on its own. Decorative unless given a `title`. */
export function LogoMark({
  className = "h-9 w-auto",
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a small static PNG; the optimiser adds nothing
    <img
      src="/brand/mark.png"
      width={MARK_SIZE.width}
      height={MARK_SIZE.height}
      alt={title ?? ""}
      aria-hidden={title ? undefined : true}
      decoding="async"
      className={className}
    />
  );
}

/**
 * The full lockup. Size it by height (`h-11 w-auto`); the width follows the
 * artwork's proportions.
 */
export default function Logo({
  className = "h-11 w-auto",
  tone = "navy",
  priority = false,
}: {
  className?: string;
  tone?: LogoTone;
  /** Load immediately — for the logo in the header, which is always on screen. */
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a small static PNG; the optimiser adds nothing
    <img
      src={LOCKUP[tone]}
      width={LOCKUP_SIZE.width}
      height={LOCKUP_SIZE.height}
      alt="GaMatech Systems"
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      className={className}
    />
  );
}
