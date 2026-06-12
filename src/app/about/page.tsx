import Image from "next/image";
import Link from "next/link";
import { OrganicBlob } from "@/components/OrganicBlob";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "About",
  description: `About ${siteConfig.name} — recipes from the kitchen, told like stories.`,
};

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      <OrganicBlob
        className="blob-drift pointer-events-none absolute -right-40 top-20 h-[400px] w-[400px] opacity-30"
        variant="primary"
      />

      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-sage">
              About
            </p>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-ink md:text-5xl">
              Who me?
            </h1>
            <div className="mt-8 space-y-5 text-base leading-relaxed text-ink-muted">
              <p>
                Hi I'm Harrison. I originally made this website to serve as an archive for my recipes.  
              </p>
              <p>
                I love the concept of food being a driver of community and connection, 
                and personally, a source of creativity. In the same tune, I want this 
                website to feel like a place where recipes can be 
                written, shared, and rediscovered.
              </p>
              <p>
                Take a look around.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/recipes"
                className="rounded-full bg-clay px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-clay-light"
              >
                Browse recipes
              </Link>
              <a
                href={siteConfig.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-clay"
              >
                TikTok
              </a>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-stone-dark px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-clay hover:text-clay"
              >
                Instagram
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-parchment">
              <Image
                src="/images/about-author.png"
                alt={`${siteConfig.author} smiling outdoors`}
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
