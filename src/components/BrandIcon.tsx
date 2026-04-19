/**
 * SPAquatoria brand pictogram system.
 * Monoline SVG icons (1.5px stroke) replacing standard emoji.
 * 24×24 grid, tintable via currentColor.
 */

const ICONS: Record<string, React.ReactNode> = {
  // Time of day
  "morning": (
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M12 17a5 5 0 100-10 5 5 0 000 10z" />
  ),
  "evening": (
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  ),
  "both": (
    <path d="M12 3v1M12 20v1M18.36 5.64l-.71.71M6.34 17.66l-.7.7M21 12h-1M4 12H3M18.36 18.36l-.71-.71M6.34 6.34l-.7-.7M16 12a4 4 0 11-8 0M8 12h8" />
  ),

  // Skin feelings
  "great": (
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
  ),
  "ok": (
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM8 15h8M9 9h.01M15 9h.01" />
  ),
  "meh": (
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM16 16s-1.5-2-4-2-4 2-4 2M9 9h.01M15 9h.01" />
  ),

  // Care priorities
  "hydration": (
    <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69z" />
  ),
  "protection": (
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  ),
  "anti-age": (
    <path d="M12 2v10l4.5 4.5M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
  ),

  // Textures
  "cream": (
    <path d="M6 12h12M6 8h12M9 16h6M8 4h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" />
  ),
  "gel": (
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6L12 2z" />
  ),
  "oil": (
    <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69zM9 13a3 3 0 003 3" />
  ),

  // Masks
  "weekly": (
    <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zM9 16l2 2 4-4" />
  ),
  "rare": (
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01" />
  ),
  "never": (
    <path d="M18 6L6 18M6 6l12 12" />
  ),

  // Discovery
  "salon": (
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  ),
  "friends": (
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" />
  ),
  "self": (
    <path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" />
  ),

  // Seasons
  "spring": (
    <path d="M12 22V8M5 12c0-5 7-10 7-10s7 5 7 10M9 17c0-2.5 3-5 3-5s3 2.5 3 5" />
  ),
  "summer": (
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 17a5 5 0 100-10 5 5 0 000 10z" />
  ),
  "autumn": (
    <path d="M11 19c-4.286 0-8-3.582-8-8 5.714 0 9.286 2.164 11 5-1.714-4.67 4.286-9 8-9-1.714 5.418-5.714 12-11 12zM7 22h10" />
  ),
  "winter": (
    <path d="M12 2v20M2 12h20M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83M7.76 7.76L12 12M12 12l4.24-4.24" />
  ),

  // Time
  "5min": (
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8" />
  ),
  "10min": (
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2" />
  ),
  "15plus": (
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l6 3M2 12h2M20 12h2" />
  ),
};

export function BrandIcon({ id, size = 20, className }: { id: string; size?: number; className?: string }) {
  const icon = ICONS[id];
  if (!icon) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {icon}
    </svg>
  );
}
