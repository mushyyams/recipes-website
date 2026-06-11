import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone bg-parchment">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl font-medium text-ink">
              {siteConfig.name}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
              {siteConfig.tagline}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
              Explore
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/recipes"
                  className="text-sm text-ink hover:text-clay"
                >
                  All Recipes
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-ink hover:text-clay"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
              Follow Along
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href={siteConfig.social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ink hover:text-clay"
                >
                  TikTok
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ink hover:text-clay"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-stone-dark pt-8 text-xs text-ink-muted sm:flex-row sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
          <p>Recipes worth making twice.</p>
        </div>
      </div>
    </footer>
  );
}
