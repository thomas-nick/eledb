"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AuthHeaderActions } from "@/components/auth/AuthHeaderActions";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/site";

const navLinks = [
  { href: "/sanctuaries", label: "Sanctuaries" },
  { href: "/camps", label: "Camps" },
  { href: "/elephants", label: "Elephants" },
  { href: "/countries", label: "Countries" },
  { href: "/corridors", label: "Corridors" },
  { href: "/coexistence", label: "Range Map" },
  { href: "/resources", label: "Field Notes" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-ivory/90 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold text-forest tracking-tight">
              {SITE_NAME}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-clay",
                  pathname === link.href ? "text-clay" : "text-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <AuthHeaderActions />
            </div>
            <Button href="/sanctuaries" size="sm" variant="secondary">
              Plan a Visit
            </Button>
            <button
              className="md:hidden p-2 text-forest"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="md:hidden pb-4 border-t border-border pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block py-2 text-sm font-medium transition-colors hover:text-clay",
                  pathname === link.href ? "text-clay" : "text-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border mt-2">
              <AuthHeaderActions />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
