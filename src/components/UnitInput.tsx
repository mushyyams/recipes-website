"use client";

import { useId } from "react";

const QUICK_PICK_UNITS = ["tsp", "tbsp", "cup", "g", "oz", "ml"];

type UnitInputProps = {
  value: string;
  onChange: (value: string) => void;
  fixedUnits: string[];
  className?: string;
};

export function UnitInput({
  value,
  onChange,
  fixedUnits,
  className,
}: UnitInputProps) {
  const listId = useId();
  const fieldClass =
    className ??
    "w-full rounded-xl border border-stone bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-sage";

  const quickPicks = QUICK_PICK_UNITS.filter(
    (unit) => fixedUnits.length === 0 || fixedUnits.includes(unit)
  );

  return (
    <div className="space-y-2">
      <input
        type="text"
        list={listId}
        className={fieldClass}
        value={value}
        placeholder="tsp, cup, g…"
        onChange={(event) => onChange(event.target.value)}
        onBlur={(event) => onChange(event.target.value.trim().toLowerCase())}
      />
      <datalist id={listId}>
        {fixedUnits.map((unit) => (
          <option key={unit} value={unit} />
        ))}
      </datalist>
      {quickPicks.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {quickPicks.map((unit) => {
            const selected = value.trim().toLowerCase() === unit;
            return (
              <button
                key={unit}
                type="button"
                onClick={() => onChange(unit)}
                className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                  selected
                    ? "bg-sage text-cream"
                    : "border border-stone text-ink-muted hover:border-sage hover:text-sage"
                }`}
              >
                {unit}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
