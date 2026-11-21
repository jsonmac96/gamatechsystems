type IconName =
  | "code"
  | "automation"
  | "web"
  | "custom"
  | "seo"
  | "aeo"
  | "marketing";

/**
 * Inline SVG service icons.
 *
 * Inline rather than image files: no extra requests, no broken-image risk, they
 * inherit `currentColor` for dark mode, and they stay crisp at any size (so
 * there is nothing to compress). Each is `aria-hidden` because the adjacent
 * heading already names the service — announcing it twice is noise for a
 * screen-reader user.
 */
export default function ServiceIcon({
  name,
  className = "h-7 w-7",
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor" as const,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false as const,
  };

  switch (name) {
    case "code":
      return (
        <svg {...common}>
          <path d="m8.5 8.5-3.5 3.5 3.5 3.5" />
          <path d="m15.5 8.5 3.5 3.5-3.5 3.5" />
          <path d="M13.2 5.5 10.8 18.5" />
        </svg>
      );

    case "automation":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2.6" />
          <path d="M12 3v2.6M12 18.4V21M3 12h2.6M18.4 12H21M5.6 5.6l1.9 1.9M16.5 16.5l1.9 1.9M18.4 5.6l-1.9 1.9M7.5 16.5l-1.9 1.9" />
        </svg>
      );

    case "web":
      return (
        <svg {...common}>
          <rect x="2.75" y="4.25" width="18.5" height="15.5" rx="2.25" />
          <path d="M2.75 8.75h18.5" />
          <circle cx="5.8" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
          <circle cx="7.9" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
          <path d="M6.5 12.5h7M6.5 15.75h4.5" />
        </svg>
      );

    case "custom":
      return (
        <svg {...common}>
          <path d="M14.7 6.1a3.4 3.4 0 0 1 4.6 4.6l-8.1 8.1-4.6 1.2 1.2-4.6Z" />
          <path d="m13.1 7.7 3.2 3.2" />
          <path d="M4 4.5h4M6 2.5v4" />
        </svg>
      );

    case "seo":
      return (
        <svg {...common}>
          <circle cx="10.6" cy="10.6" r="6.1" />
          <path d="m15.2 15.2 4.4 4.4" />
          <path d="m7.9 11.4 1.9 2 3.5-4.1" />
        </svg>
      );

    case "aeo":
      return (
        <svg {...common}>
          <path d="M8.5 20.5v-2.1a6.2 6.2 0 1 1 7 0v2.1a1.4 1.4 0 0 1-1.4 1.4H9.9a1.4 1.4 0 0 1-1.4-1.4Z" />
          <path d="M9.9 17.6h4.2" />
          <path d="M12 2.5v1.6M4.6 6l1.3.9M19.4 6l-1.3.9" />
        </svg>
      );

    case "marketing":
      return (
        <svg {...common}>
          <path d="M3.5 9.5v5l12 4.5V5L3.5 9.5Z" />
          <path d="M15.5 8.5a3.5 3.5 0 0 1 0 7" />
          <path d="M6.5 14.9v3.4a1.6 1.6 0 0 0 3.2 0v-2.2" />
        </svg>
      );
  }
}
