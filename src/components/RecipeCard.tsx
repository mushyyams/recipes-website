import Image from "next/image";
import Link from "next/link";
import type { RatingSummary } from "@/lib/ratings";
import type { RecipeMeta } from "@/lib/recipes";

type RecipeCardProps = {
  recipe: RecipeMeta;
  featured?: boolean;
  rating?: RatingSummary;
};

function RecipeRatingLabel({ rating }: { rating: RatingSummary }) {
  if (!rating.count) return null;

  return (
    <p className="text-xs text-ink-muted">
      ★ {rating.average?.toFixed(1)} ({rating.count} rating
      {rating.count === 1 ? "" : "s"})
    </p>
  );
}

export function RecipeCard({ recipe, featured = false, rating }: RecipeCardProps) {
  if (featured) {
    return (
      <Link
        href={`/recipes/${recipe.slug}`}
        className="group relative grid overflow-hidden rounded-[2rem] bg-parchment md:grid-cols-2"
      >
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[420px]">
          <Image
            src={recipe.image}
            alt={recipe.imageAlt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.15em] text-ink-muted">
            <span>{recipe.category}</span>
            <span className="h-1 w-1 rounded-full bg-clay" />
            <span>{recipe.cookTime}</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight text-ink transition-colors group-hover:text-clay md:text-4xl">
            {recipe.title}
          </h2>
          {rating ? (
            <div className="mt-3">
              <RecipeRatingLabel rating={rating} />
            </div>
          ) : null}
          <p className="mt-4 line-clamp-3 text-base leading-relaxed text-ink-muted">
            {recipe.excerpt}
          </p>
          <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-clay">
            Read the recipe
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group flex flex-col overflow-hidden rounded-[1.75rem] bg-parchment transition-shadow hover:shadow-lg hover:shadow-stone-dark/30"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={recipe.image}
          alt={recipe.imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-xs font-medium text-ink backdrop-blur-sm">
          {recipe.category}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span>{recipe.prepTime} prep</span>
          <span>·</span>
          <span>{recipe.difficulty}</span>
        </div>
        <h3 className="mt-2 font-display text-xl font-medium leading-snug tracking-tight text-ink transition-colors group-hover:text-clay">
          {recipe.title}
        </h3>
        {rating ? (
          <div className="mt-2">
            <RecipeRatingLabel rating={rating} />
          </div>
        ) : null}
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-muted">
          {recipe.excerpt}
        </p>
      </div>
    </Link>
  );
}
