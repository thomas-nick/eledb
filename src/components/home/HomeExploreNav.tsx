"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const homeLinks = [
  { href: "/elephants", label: "Database" },
  { href: "/countries", label: "Countries" },
  { href: "/camps", label: "Camps" },
  { href: "/sanctuaries", label: "Sanctuaries" },
  { href: "/coexistence", label: "Range Map" },
  { href: "/resources", label: "Field Notes" },
  { href: "/corridors", label: "Corridors" },
];

export function HomeExploreNav() {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <nav aria-label="Explore" className="flex flex-wrap gap-2">
      {homeLinks.map((link) => {
        const active =
          !onHome && (pathname === link.href || pathname.startsWith(`${link.href}/`));
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "whitespace-nowrap rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
              active
                ? "border-forest/25 bg-white text-forest shadow-sm"
                : "border-border/70 bg-white/55 text-slate-600 hover:border-border hover:bg-white hover:text-forest"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
