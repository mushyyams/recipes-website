import { getAllForks } from "@/lib/forks";
import { getAllRecipes } from "@/lib/recipes";
import {
  countCustomUnitsFromIngredients,
  readRecipeUnitsConfig,
  updateCustomUnitUsage,
  type RecipeUnitsConfig,
} from "@/lib/recipe-units";

export async function recalculateCustomUnitUsage(): Promise<RecipeUnitsConfig> {
  const config = readRecipeUnitsConfig();
  const usage: Record<string, number> = {};

  for (const recipe of getAllRecipes()) {
    countCustomUnitsFromIngredients(recipe.ingredients, config.fixedUnits, usage);
  }

  const forks = await getAllForks();
  for (const fork of forks) {
    countCustomUnitsFromIngredients(fork.ingredients, config.fixedUnits, usage);
  }

  return updateCustomUnitUsage(usage);
}
