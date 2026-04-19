"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ROLES = [
  { href: "/", label: "Клиент", match: (p: string) => p === "/" || p === "/catalog" || p.startsWith("/catalog/") || p === "/ingredients" || p.startsWith("/lines") || p === "/about" || p === "/profile" || p === "/cart" || p === "/routine" || p === "/season" || p === "/test" },
  { href: "/dealers", label: "Салон", match: (p: string) => p === "/dealers" },
  { href: "/b2b", label: "Партнёр", match: (p: string) => p === "/b2b" },
];

export function RoleSwitcher() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-0.5">
      {ROLES.map((role) => {
        const active = role.match(pathname);
        return (
          <Link
            key={role.href}
            href={role.href}
            className="relative px-3 py-1.5 tap"
            style={{
              fontSize: "10px",
              fontWeight: active ? 500 : 400,
              letterSpacing: "0.14em",
              textTransform: "uppercase" as const,
              color: active ? "var(--lp-ink)" : "var(--lp-tertiary)",
              transition: "color 0.25s ease",
            }}
          >
            {role.label}
            {active && (
              <span
                className="absolute bottom-0 left-3 right-3"
                style={{
                  height: "1.5px",
                  background: "var(--lp-ink)",
                  borderRadius: "1px",
                }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
