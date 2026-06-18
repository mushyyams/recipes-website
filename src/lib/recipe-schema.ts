import { ingredientsToDisplayStrings } from "@/lib/ingredients";
import { getMethodSteps } from "@/lib/steps";
import type { Recipe } from "@/lib/recipes";
import type { RatingSummary } from "@/lib/ratings";
import { absoluteUrl, siteConfig } from "@/lib/site";

type RecipeJsonLdOptions = {
  rating?: RatingSummary;
};

/** Converts strings like "10 min" or "1 hr 30 min" to ISO 8601 duration (e.g. PT10M). */
export function parseDurationToIso(time: string): string | undefined {
  const normalized = time.trim().toLowerCase();
  const hourMatch = normalized.match(/(\d+)\s*(?:h|hr|hrs|hour|hours)\b/);
  const minMatch = normalized.match(/(\d+)\s*(?:m|min|mins|minute|minutes)\b/);

  let hours = hourMatch ? Number.parseInt(hourMatch[1], 10) : 0;
  let minutes = minMatch ? Number.parseInt(minMatch[1], 10) : 0;

  if (!hourMatch && !minMatch) {
    const onlyNumber = normalized.match(/^(\d+)$/);
    if (onlyNumber) minutes = Number.parseInt(onlyNumber[1], 10);
  }

  if (hours === 0 && minutes === 0) return undefined;

  let iso = "PT";
  if (hours > 0) iso += `${hours}H`;
  if (minutes > 0) iso += `${minutes}M`;
  return iso;
}

export function buildRecipeJsonLd(recipe: Recipe, options: RecipeJsonLdOptions = {}) {
  const prepTime = parseDurationToIso(recipe.prepTime);
  const cookTime = parseDurationToIso(recipe.cookTime);
  const totalMinutes =
    (prepTime ? durationIsoToMinutes(prepTime) : 0) +
    (cookTime ? durationIsoToMinutes(cookTime) : 0);
  const rating = options.rating;
  const hasRatings =
    rating && rating.count > 0 && rating.average !== null;

  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.excerpt,
    image: [recipe.image],
    author: {
      "@type": "Person",
      name: siteConfig.author,
    },
    datePublished: recipe.publishedAt,
    prepTime,
    cookTime,
    ...(totalMinutes > 0 ? { totalTime: `PT${totalMinutes}M` } : {}),
    recipeYield: `${recipe.servings} servings`,
    recipeCategory: recipe.category,
    keywords: recipe.tags.join(", "),
    recipeIngredient: ingredientsToDisplayStrings(recipe.ingredients),
    recipeInstructions: getMethodSteps(recipe.steps).map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text,
    })),
    ...(recipe.video
      ? {
          video: {
            "@type": "VideoObject",
            name: recipe.title,
            description: recipe.excerpt,
            thumbnailUrl: [recipe.image],
            uploadDate: recipe.publishedAt,
            contentUrl: recipe.video,
          },
        }
      : {}),
    ...(hasRatings
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.average,
            ratingCount: rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    url: absoluteUrl(`/recipes/${recipe.slug}`),
  };
}

function durationIsoToMinutes(iso: string): number {
  const hours = iso.match(/(\d+)H/)?.[1];
  const minutes = iso.match(/(\d+)M/)?.[1];
  return (hours ? Number.parseInt(hours, 10) * 60 : 0) + (minutes ? Number.parseInt(minutes, 10) : 0);
}
