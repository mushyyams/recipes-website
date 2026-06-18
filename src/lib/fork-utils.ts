import { getIngredientItems, type RecipeIngredientLine } from "@/lib/ingredients";
import { getMethodSteps, type RecipeStepLine } from "@/lib/steps";

export function summarizeForkChanges(
  original: { ingredients: RecipeIngredientLine[]; steps: RecipeStepLine[] },
  fork: { ingredients: RecipeIngredientLine[]; steps: RecipeStepLine[] }
): string {
  const ingredientDelta =
    getIngredientItems(fork.ingredients).length -
    getIngredientItems(original.ingredients).length;
  const stepDelta =
    getMethodSteps(fork.steps).length - getMethodSteps(original.steps).length;
  const parts: string[] = [];

  if (ingredientDelta !== 0) {
    parts.push(
      `${Math.abs(ingredientDelta)} ingredient${Math.abs(ingredientDelta) === 1 ? "" : "s"} ${ingredientDelta > 0 ? "added" : "removed"}`
    );
  }
  if (stepDelta !== 0) {
    parts.push(
      `${Math.abs(stepDelta)} step${Math.abs(stepDelta) === 1 ? "" : "s"} changed`
    );
  }

  if (parts.length === 0) {
    return "Tweaked amounts and technique";
  }

  return parts.join(" · ");
}
