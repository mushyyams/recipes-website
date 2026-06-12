import { RecipeCard } from "@/components/RecipeCard";
import { getForkCountsByRecipeSlug } from "@/lib/forks";
import { getAllRecipes, getAllCategories } from "@/lib/recipes";
import { getRecipeRatingSummaries } from "@/lib/ratings";
import { absoluteUrl } from "@/lib/site";

export const metadata = {
  title: "Recipes",
  description: "Browse all recipes from the kitchen — dinners, snacks, pasta, and more.",
  alternates: {
    canonical: absoluteUrl("/recipes"),
  },
};

export default async function RecipesPage() {
  const recipes = getAllRecipes();
  const categories = getAllCategories();
  const recipeSlugs = recipes.map((recipe) => recipe.slug);
  const [ratingSummaries, forkCounts] = await Promise.all([
    getRecipeRatingSummaries(recipeSlugs),
    getForkCountsByRecipeSlug(recipeSlugs),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-24">
      <header className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-sage">
          The archive
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-ink md:text-5xl">
          All recipes
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">
          Browse the full archive — filter by category below.
        </p>
      </header>

      {categories.length > 1 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {categories.map((category) => (
            <span
              key={category}
              className="rounded-full border border-stone-dark px-4 py-1.5 text-sm text-ink-muted"
            >
              {category}
            </span>
          ))}
        </div>
      )}

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.slug}
            recipe={recipe}
            rating={ratingSummaries[recipe.slug]}
            forkCount={forkCounts[recipe.slug]}
          />
        ))}
      </div>
    </div>
  );
}
