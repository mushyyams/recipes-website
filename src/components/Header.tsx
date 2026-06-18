"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site";

const navLinks = [
  { href: "/recipes", label: "Recipes" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-stone/60 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="group flex flex-col">
          <span className="font-display text-xl font-medium tracking-tight text-ink transition-colors group-hover:text-clay">
            {siteConfig.name}
          </span>
          <span className="hidden text-[11px] uppercase tracking-[0.2em] text-ink-muted sm:block">
            Recipe Journal
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-parchment text-ink"
                    : "text-ink-muted hover:bg-parchment hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/admin"
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              pathname.startsWith("/admin")
                ? "bg-parchment text-ink"
                : "text-ink-muted hover:bg-parchment hover:text-ink"
            }`}
          >
            Add a recipe
          </Link>
          <a
            href={siteConfig.social.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 hidden rounded-full bg-ink px-4 py-2 text-sm text-cream transition-colors hover:bg-clay sm:inline-block"
          >
            Watch on TikTok
          </a>
        </nav>
      </div>
    </header>
  );
}
