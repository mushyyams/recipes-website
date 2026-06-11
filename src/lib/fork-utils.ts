export function summarizeForkChanges(
  original: { ingredients: string[]; steps: string[] },
  fork: { ingredients: string[]; steps: string[] }
): string {
  const ingredientDelta =
    fork.ingredients.length - original.ingredients.length;
  const stepDelta = fork.steps.length - original.steps.length;
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
