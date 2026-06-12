import Link from "next/link";
import { RecipeCard } from "@/components/RecipeCard";
import { OrganicBlob } from "@/components/OrganicBlob";
import { getForkCountsByRecipeSlug } from "@/lib/forks";
import { getAllRecipes, getFeaturedRecipes } from "@/lib/recipes";
import { getRecipeRatingSummaries } from "@/lib/ratings";
import { siteConfig } from "@/lib/site";

export default async function HomePage() {
  const featured = getFeaturedRecipes();
  const heroRecipe = featured[0];
  const latest = getAllRecipes().slice(0, 3);
  const secondaryFeatured = featured.slice(1);

  const displayedSlugs = [
    ...new Set([
      ...(heroRecipe ? [heroRecipe.slug] : []),
      ...latest.map((recipe) => recipe.slug),
      ...secondaryFeatured.map((recipe) => recipe.slug),
    ]),
  ];

  const [ratingSummaries, forkCounts] = await Promise.all([
    getRecipeRatingSummaries(displayedSlugs),
    getForkCountsByRecipeSlug(displayedSlugs),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <OrganicBlob
          className="blob-drift pointer-events-none absolute -right-32 -top-20 h-[500px] w-[500px] opacity-60"
          variant="primary"
        />
        <OrganicBlob
          className="blob-drift-slow pointer-events-none absolute -left-24 bottom-0 h-[350px] w-[350px] opacity-40"
          variant="secondary"
        />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-sage">
              A recipe Journal
            </p>
            <h1 className="mt-4 font-display text-5xl font-medium leading-[1.1] tracking-tight text-ink md:text-6xl lg:text-7xl">
              In the kitchen{" "}
              <span className="italic text-clay">making something.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-muted">
              {siteConfig.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/recipes"
                className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-clay"
              >
                Browse all recipes
              </Link>
              <a
                href={siteConfig.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-stone-dark px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-clay hover:text-clay"
              >
                Watch on TikTok
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured story */}
      {heroRecipe && (
        <section className="mx-auto max-w-6xl px-6 pb-20 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
                Featured
              </p>
              <h2 className="mt-2 font-display text-3xl font-medium text-ink">
                Editor&apos;s pick
              </h2>
            </div>
          </div>
          <RecipeCard
            recipe={heroRecipe}
            featured
            rating={ratingSummaries[heroRecipe.slug]}
            forkCount={forkCounts[heroRecipe.slug]}
          />
        </section>
      )}

      {/* Latest recipes grid */}
      <section className="bg-parchment py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
                From the kitchen
              </p>
              <h2 className="mt-2 font-display text-3xl font-medium text-ink">
                Latest recipes
              </h2>
            </div>
            <Link
              href="/recipes"
              className="hidden text-sm font-medium text-clay hover:underline sm:block"
            >
              View all →
            </Link>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((recipe) => (
              <RecipeCard
                key={recipe.slug}
                recipe={recipe}
                rating={ratingSummaries[recipe.slug]}
                forkCount={forkCounts[recipe.slug]}
              />
            ))}
          </div>

          <div className="mt-10 text-center sm:hidden">
            <Link
              href="/recipes"
              className="text-sm font-medium text-clay hover:underline"
            >
              View all recipes →
            </Link>
          </div>
        </div>
      </section>

      {/* Second featured */}
      {secondaryFeatured.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {secondaryFeatured.map((recipe) => (
              <RecipeCard
                key={recipe.slug}
                recipe={recipe}
                rating={ratingSummaries[recipe.slug]}
                forkCount={forkCounts[recipe.slug]}
              />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter-style CTA */}
      <section className="relative overflow-hidden border-t border-stone">
        <OrganicBlob
          className="pointer-events-none absolute -right-20 top-1/2 h-[300px] w-[300px] -translate-y-1/2 opacity-30"
          variant="secondary"
        />
        <div className="relative mx-auto max-w-6xl px-6 py-20 text-center lg:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-sage">
            New recipes every two weeks
          </p>
          <h2 className="mx-auto mt-4 max-w-lg font-display text-3xl font-medium text-ink md:text-4xl">
            Every dish starts as a video. The good ones end up here.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-ink-muted">
            Follow along on TikTok for the quick version — then come back here
            for the full story, tips, and exact measurements.
          </p>
          <a
            href={siteConfig.social.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-clay px-8 py-3 text-sm font-medium text-cream transition-colors hover:bg-clay-light"
          >
            Follow on TikTok
          </a>
        </div>
      </section>
    </>
  );
}
