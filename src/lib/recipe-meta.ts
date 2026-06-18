export const RECIPE_CATEGORIES = [
  "Dinner",
  "Lunch",
  "Breakfast",
  "Snacks",
  "Pasta",
  "Dessert",
  "Drinks",
] as const;

export const RECIPE_DIFFICULTIES = ["Easy", "Medium", "Advanced"] as const;

export type RecipeDifficulty = (typeof RECIPE_DIFFICULTIES)[number];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugifyRecipeTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isValidRecipeSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}
