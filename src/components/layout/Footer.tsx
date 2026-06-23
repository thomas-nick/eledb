import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SITE_NAME } from "@/lib/site";

const footerLinks = {
  Explore: [
    { href: "/sanctuaries", label: "Sanctuaries" },
    { href: "/camps", label: "Camps" },
    { href: "/elephants", label: "Elephant Database" },
    { href: "/countries", label: "Countries" },
    { href: "/corridors", label: "Wild Corridors" },
    { href: "/coexistence", label: "Range Map" },
    { href: "/resources", label: "Field Notes" },
  ],
  About: [
    { href: "/about", label: "About" },
    { href: "/donate", label: "Support Corridors" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-forest text-ivory mt-auto">
      <Container className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h3 className="font-serif text-2xl font-bold mb-4 tracking-tight">{SITE_NAME}</h3>
            <p className="text-ivory/70 max-w-md leading-relaxed">
              A resource for people who love Asian elephants — where to visit, 
              what to know about mahout culture, wild corridors, and field notes 
              from across Asia.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-clay-light">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-ivory/70 hover:text-ivory transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-ivory/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-ivory/50 text-sm">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-ivory/50 text-sm">
            Revered across Asia. Respected in context.
          </p>
        </div>
      </Container>
    </footer>
  );
}
