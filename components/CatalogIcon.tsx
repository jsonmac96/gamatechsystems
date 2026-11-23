type IconName =
  // products
  | "restaurant"
  | "retail"
  | "erp"
  | "people"
  | "triage"
  | "crm"
  // services
  | "web"
  | "code"
  | "ai"
  | "ads"
  | "seo"
  | "cart";

/**
 * Inline SVG icons for the products and services.
 *
 * Inline rather than image files: no extra requests, nothing to compress,
 * crisp at any size, and they inherit `currentColor` for dark mode. Each is
 * `aria-hidden` because the adjacent heading already names the item —
 * announcing it twice is noise for a screen-reader user.
 */
export default function CatalogIcon({
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
    case "restaurant": // cloche
      return (
        <svg {...common}>
          <path d="M3 17.5h18" />
          <path d="M4.5 14.5a7.5 7.5 0 0 1 15 0" />
          <path d="M12 7V5.2" />
          <circle cx="12" cy="4.3" r="1" />
          <path d="M5.5 20.5h13" />
        </svg>
      );

    case "retail": // shop front
      return (
        <svg {...common}>
          <path d="M4 9.5V20h16V9.5" />
          <path d="M3 9.5 4.6 4.5h14.8L21 9.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0Z" />
          <path d="M9.5 20v-5.5h5V20" />
        </svg>
      );

    case "erp": // layered modules
      return (
        <svg {...common}>
          <path d="M12 3 21 7.5 12 12 3 7.5 12 3Z" />
          <path d="M3 12.2 12 16.7l9-4.5" />
          <path d="M3 16.8 12 21.3l9-4.5" />
        </svg>
      );

    case "people": // team
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
          <path d="M16 5.6a3.2 3.2 0 0 1 0 6.3" />
          <path d="M17.5 14.8a5.5 5.5 0 0 1 3 4.7" />
        </svg>
      );

    case "triage": // ticket with priority
      return (
        <svg {...common}>
          <path d="M3.5 8.5V6.5h17v2a2 2 0 0 0 0 4v2h-17v-2a2 2 0 0 0 0-4Z" />
          <path d="M8.5 6.5v8M12.5 10h4" />
          <path d="M5 18.5h14" />
        </svg>
      );

    case "crm": // kanban board
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M8.5 4v16M15.5 4v16" />
          <path d="M5 8h1.5M10.5 8h3M17.5 8h1.5M5 11.5h1.5M10.5 11.5h3" />
        </svg>
      );

    case "web": // browser + globe
      return (
        <svg {...common}>
          <rect x="2.75" y="4.25" width="18.5" height="15.5" rx="2.25" />
          <path d="M2.75 8.75h18.5" />
          <circle cx="5.8" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
          <circle cx="7.9" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
          <circle cx="12" cy="14.2" r="3.2" />
          <path d="M8.8 14.2h6.4M12 11v6.4" />
        </svg>
      );

    case "code":
      return (
        <svg {...common}>
          <path d="m8.5 8.5-3.5 3.5 3.5 3.5" />
          <path d="m15.5 8.5 3.5 3.5-3.5 3.5" />
          <path d="M13.2 5.5 10.8 18.5" />
        </svg>
      );

    case "ai": // spark / neural
      return (
        <svg {...common}>
          <path d="M12 3.2 13.6 8l4.8 1.6-4.8 1.6L12 16l-1.6-4.8L5.6 9.6 10.4 8 12 3.2Z" />
          <path d="M18.5 15.5l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z" />
          <path d="M5 16.5v4M3 18.5h4" />
        </svg>
      );

    case "ads": // megaphone + target
      return (
        <svg {...common}>
          <path d="M3.5 9.5v5l12 4.5V5L3.5 9.5Z" />
          <path d="M15.5 8.5a3.5 3.5 0 0 1 0 7" />
          <path d="M6.5 14.9v3.4a1.6 1.6 0 0 0 3.2 0v-2.2" />
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

    case "cart":
      return (
        <svg {...common}>
          <path d="M2.8 4h2.1l2.3 10.4h9.6l2.2-7.4H6.3" />
          <circle cx="9" cy="19" r="1.4" />
          <circle cx="16.5" cy="19" r="1.4" />
        </svg>
      );
  }
}
