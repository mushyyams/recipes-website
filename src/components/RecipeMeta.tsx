import type { RecipeMeta as RecipeMetaType } from "@/lib/recipes";

export function RecipeMetaBar({ recipe }: { recipe: RecipeMetaType }) {
  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-4 border-y border-stone py-6">
      <div>
        <dt className="text-xs uppercase tracking-[0.15em] text-ink-muted">
          Prep
        </dt>
        <dd className="mt-1 font-medium text-ink">{recipe.prepTime}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-[0.15em] text-ink-muted">
          Cook
        </dt>
        <dd className="mt-1 font-medium text-ink">{recipe.cookTime}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-[0.15em] text-ink-muted">
          Serves
        </dt>
        <dd className="mt-1 font-medium text-ink">{recipe.servings}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-[0.15em] text-ink-muted">
          Level
        </dt>
        <dd className="mt-1 font-medium text-ink">{recipe.difficulty}</dd>
      </div>
    </dl>
  );
}
