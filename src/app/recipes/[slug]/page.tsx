import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ForkRecipePanel } from "@/components/ForkRecipePanel";
import { ForkVariations } from "@/components/ForkVariations";
import { IngredientList } from "@/components/IngredientList";
import { RecipeMetaBar } from "@/components/RecipeMeta";
import { RecipeRating } from "@/components/RecipeRating";
import { StepList } from "@/components/StepList";
import { getForksForRecipe } from "@/lib/forks";
import { getAllRecipes, getRecipeBySlug } from "@/lib/recipes";
import { siteConfig } from "@/lib/site";

export const revalidate = 30;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllRecipes().map((recipe) => ({ slug: recipe.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);
  if (!recipe) return {};

  return {
    title: recipe.title,
    description: recipe.excerpt,
    openGraph: {
      title: recipe.title,
      description: recipe.excerpt,
      images: [{ url: recipe.image, alt: recipe.imageAlt }],
    },
  };
}

export default async function RecipePage({ params }: PageProps) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);
  if (!recipe) notFound();

  const forks = await getForksForRecipe(slug);

  const formattedDate = new Date(recipe.publishedAt).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" }
  );

  return (
    <article>
      {/* Hero image */}
      <div className="relative aspect-[16/9] w-full max-h-[70vh] overflow-hidden bg-parchment md:aspect-[21/9]">
        <Image
          src={recipe.image}
          alt={recipe.imageAlt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Article header */}
        <header className="mx-auto max-w-3xl pt-12 md:pt-16">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.15em] text-ink-muted">
            <span>{recipe.category}</span>
            <span className="h-1 w-1 rounded-full bg-clay" />
            <time dateTime={recipe.publishedAt}>{formattedDate}</time>
          </div>

          <h1 className="mt-5 font-display text-4xl font-medium leading-[1.1] tracking-tight text-ink md:text-5xl lg:text-6xl">
            {recipe.title}
          </h1>

          <p className="mt-6 text-xl leading-relaxed text-ink-muted md:text-2xl md:leading-relaxed">
            {recipe.excerpt}
          </p>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage/20 font-display text-sm font-medium text-sage">
              {siteConfig.author.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-ink">{siteConfig.author}</p>
              <p className="text-xs text-ink-muted">Recipe developer</p>
            </div>
          </div>

          <RecipeMetaBar recipe={recipe} />

          <div className="pt-6">
            <RecipeRating targetType="original" recipeSlug={recipe.slug} />
          </div>

          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-6">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-parchment px-3 py-1 text-xs text-ink-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Recipe body: sidebar + content */}
        <div className="mx-auto grid max-w-6xl gap-12 py-12 lg:grid-cols-[1fr_340px] lg:gap-16 lg:py-16">
          <div className="order-2 lg:order-1">
            <StepList steps={recipe.steps} />

            {recipe.content.trim() && (
              <div className="prose-recipe mt-16 border-t border-stone pt-12">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {recipe.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          <aside className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <IngredientList ingredients={recipe.ingredients} />

              <div className="mt-6 rounded-[1.5rem] border border-stone bg-cream p-6">
                <p className="font-display text-lg font-medium text-ink">
                  Watched the video?
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  This is the full write-up with exact measurements and tips.
                </p>
                <a
                  href={siteConfig.social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm font-medium text-clay hover:underline"
                >
                  Find it on TikTok →
                </a>
              </div>

              <ForkRecipePanel slug={recipe.slug} forkCount={forks.length} />
            </div>
          </aside>
        </div>

        <ForkVariations recipe={recipe} forks={forks} />
      </div>

      {/* Back link */}
      <div className="border-t border-stone bg-parchment py-12">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <Link
            href="/recipes"
            className="text-sm font-medium text-clay hover:underline"
          >
            ← Back to all recipes
          </Link>
        </div>
      </div>
    </article>
  );
}
