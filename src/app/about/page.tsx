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
              The kitchen, on the record.
            </h1>
            <div className="mt-8 space-y-5 text-base leading-relaxed text-ink-muted">
              <p>
                Hi — I&apos;m {siteConfig.author}. I make cooking videos on
                TikTok, and this site is where the recipes live in full: the
                measurements, the technique notes, and the context that
                doesn&apos;t fit in sixty seconds.
              </p>
              <p>
                Think of it less like a recipe box and more like a small food
                publication. Every dish here started as something I actually
                made, filmed, and ate. If it&apos;s on this site, it&apos;s
                because I&apos;d make it again.
              </p>
              <p>
                The aesthetic? Honest food, written with care. No filler, no
                life stories before the ingredients — just good recipes with
                enough personality to feel human.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
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
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80"
                alt="Cooking in a bright kitchen"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-[1.25rem] bg-clay px-6 py-4 text-cream md:-left-10">
              <p className="font-display text-2xl font-medium">60s</p>
              <p className="text-xs uppercase tracking-wider opacity-80">
                to full story
              </p>
            </div>
          </div>
        </div>

        <section className="mt-24 rounded-[2rem] bg-parchment p-8 md:p-12">
          <h2 className="font-display text-2xl font-medium text-ink">
            How to use this site
          </h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div>
              <p className="font-display text-lg font-medium text-clay">01</p>
              <p className="mt-2 font-medium text-ink">Watch the video</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Start on TikTok for the quick, visual version — see the texture,
                hear the sizzle.
              </p>
            </div>
            <div>
              <p className="font-display text-lg font-medium text-clay">02</p>
              <p className="mt-2 font-medium text-ink">Read the full recipe</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Come here for exact measurements, timing, and the tips from the
                comment section.
              </p>
            </div>
            <div>
              <p className="font-display text-lg font-medium text-clay">03</p>
              <p className="mt-2 font-medium text-ink">Cook it your way</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                These are starting points, not commandments. Adjust, substitute,
                make it yours.
              </p>
            </div>
          </div>
          <div className="mt-10">
            <Link
              href="/recipes"
              className="text-sm font-medium text-clay hover:underline"
            >
              Browse all recipes →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
