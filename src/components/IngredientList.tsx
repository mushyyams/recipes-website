"use client";

import { useState } from "react";

type IngredientListProps = {
  ingredients: string[];
};

export function IngredientList({ ingredients }: IngredientListProps) {
  const [checked, setChecked] = useState<Set<number>>(() => new Set());

  function toggle(index: number) {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <div className="rounded-[1.5rem] bg-parchment p-6 md:p-8">
      <h2 className="font-display text-xl font-medium text-ink">Ingredients</h2>
      <ul className="mt-5 space-y-3">
        {ingredients.map((item, index) => {
          const isChecked = checked.has(index);

          return (
            <li key={`${index}-${item}`}>
              <label className="group flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(index)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-clay/40 ${
                    isChecked
                      ? "border-clay bg-clay"
                      : "border-stone-dark bg-cream"
                  }`}
                >
                  {isChecked ? (
                    <svg
                      className="h-2.5 w-2.5 text-cream"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  ) : null}
                </span>
                <span
                  className={
                    isChecked
                      ? "text-ink-muted/70 line-through decoration-ink-muted/50 transition-colors"
                      : "text-ink-muted transition-colors group-hover:text-ink"
                  }
                >
                  {item}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
