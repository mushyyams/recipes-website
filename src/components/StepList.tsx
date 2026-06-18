import { IngredientSubheader } from "@/components/IngredientSubheader";
import {
  getStepDisplayNumber,
  isMethodSection,
  type RecipeStepLine,
} from "@/lib/steps";

export function StepList({ steps }: { steps: RecipeStepLine[] }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-medium text-ink">Method</h2>
      <ol className="mt-6 space-y-8">
        {steps.map((line, index) => {
          if (isMethodSection(line)) {
            return (
              <li key={`${index}-section`} className="list-none">
                <IngredientSubheader label={line.label} />
              </li>
            );
          }

          const stepNumber = getStepDisplayNumber(steps, index);

          return (
            <li key={`${index}-${line}`} className="flex gap-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage/15 font-display text-sm font-medium text-sage">
                {stepNumber}
              </span>
              <p className="pt-1.5 text-base leading-relaxed text-ink-muted">
                {line}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
