"use client";

import {
  formatRecipeTime,
  parseRecipeTime,
  type RecipeTimeParts,
} from "@/lib/recipe-time";

type TimeInputProps = {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function TimeInput({ id, label, value, onChange }: TimeInputProps) {
  const parts = parseRecipeTime(value);

  function update(next: Partial<RecipeTimeParts>) {
    onChange(formatRecipeTime({ ...parts, ...next }));
  }

  const fieldClass =
    "w-[4rem] shrink-0 rounded-xl border border-stone bg-cream px-2 py-2 text-sm text-ink outline-none focus:border-sage";

  return (
    <div>
      <label className="text-sm font-medium text-ink" htmlFor={id}>
        {label}
      </label>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          id={id}
          type="number"
          min={0}
          step={1}
          className={fieldClass}
          value={parts.hours}
          placeholder="0"
          aria-label={`${label} hours`}
          onChange={(event) => update({ hours: event.target.value })}
        />
        <span className="text-xs text-ink-muted">hr</span>
        <input
          id={id ? `${id}-minutes` : undefined}
          type="number"
          min={0}
          max={59}
          step={1}
          className={fieldClass}
          value={parts.minutes}
          placeholder="0"
          aria-label={`${label} minutes`}
          onChange={(event) => update({ minutes: event.target.value })}
        />
        <span className="text-xs text-ink-muted">min</span>
      </div>
    </div>
  );
}
