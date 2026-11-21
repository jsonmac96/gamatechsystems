/**
 * GamaTech Systems mark — an interlocking "G" built from circuit segments.
 *
 * Inline SVG so it costs no request, scales losslessly and adapts to dark mode.
 * It is decorative here: the wordmark beside it carries the accessible name.
 */
export default function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="gts-logo-grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22c9ee" />
          <stop offset="0.55" stopColor="#06a9d4" />
          <stop offset="1" stopColor="#0d6b90" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#gts-logo-grad)" />

      {/* The G */}
      <path
        d="M31.5 17.8a9.4 9.4 0 1 0 1.1 10.9h-8.2"
        stroke="white"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Circuit nodes, echoing the "systems" half of the name */}
      <circle cx="33" cy="15.5" r="2.4" fill="#0a101a" fillOpacity="0.85" />
      <circle cx="33" cy="28.7" r="2.2" fill="#0a101a" fillOpacity="0.85" />
      <circle cx="16" cy="33" r="2" fill="white" fillOpacity="0.9" />
    </svg>
  );
}
