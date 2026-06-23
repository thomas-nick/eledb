"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const exploreLinks = [
  { href: "/elephants", label: "Database" },
  { href: "/countries", label: "Countries" },
  { href: "/camps", label: "Camps" },
  { href: "/coexistence", label: "Range Map" },
  { href: "/corridors", label: "Corridors" },
];

export function ExploreNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Explore"
      className="flex gap-1 overflow-x-auto border-b border-slate-200 -mb-px"
    >
      {exploreLinks.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
              active
                ? "border-forest text-forest"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
