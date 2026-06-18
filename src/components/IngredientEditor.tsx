"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ReorderList } from "@/components/ReorderList";
import { UnitInput } from "@/components/UnitInput";
import { useScrollToRow } from "@/hooks/useScrollToRow";
import {
  isIngredientSection,
  type RecipeIngredientLine,
} from "@/lib/ingredients";

type IngredientEditorProps = {
  value: RecipeIngredientLine[];
  onChange: (ingredients: RecipeIngredientLine[]) => void;
  scrollToIndex?: number | null;
  onScrollToIndexHandled?: () => void;
};

type UnitState = {
  fixedUnits: string[];
};

export function IngredientEditor({
  value,
  onChange,
  scrollToIndex,
  onScrollToIndexHandled,
}: IngredientEditorProps) {
  const [units, setUnits] = useState<UnitState>({ fixedUnits: [] });
  const listRef = useRef<HTMLDivElement>(null);

  useScrollToRow(listRef, scrollToIndex, value.length, onScrollToIndexHandled);

  useEffect(() => {
    fetch("/api/units")
      .then((response) => response.json())
      .then((data: { fixedUnits?: string[] }) => {
        setUnits({ fixedUnits: data.fixedUnits ?? [] });
      })
      .catch(() => {
        setUnits({ fixedUnits: [] });
      });
  }, []);

  const updateLine = useCallback(
    (index: number, nextLine: RecipeIngredientLine) => {
      onChange(
        value.map((row, rowIndex) => (rowIndex === index ? nextLine : row))
      );
    },
    [onChange, value]
  );

  const removeRow = useCallback(
    (index: number) => {
      onChange(value.filter((_, rowIndex) => rowIndex !== index));
    },
    [onChange, value]
  );

  const fieldClass =
    "w-full rounded-xl border border-stone bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-sage";

  const renderRow = (row: RecipeIngredientLine, index: number) => {
    if (isIngredientSection(row)) {
      return (
        <div className="py-1">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-stone-dark/50" aria-hidden />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent px-2 py-1 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-sage outline-none placeholder:text-sage/40 focus:ring-0"
              value={row.label}
              placeholder="Section name"
              onChange={(event) =>
                updateLine(index, {
                  type: "section",
                  label: event.target.value,
                })
              }
            />
            <span className="h-px flex-1 bg-stone-dark/50" aria-hidden />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="rounded-full border border-clay/30 px-3 py-1 text-xs text-clay hover:bg-clay/10"
            >
              Remove
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-stone bg-parchment/60 p-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,5rem)_minmax(0,7.5rem)_1fr]">
          <div>
            <label className="text-xs font-medium text-ink-muted">Amount</label>
            <input
              className={`${fieldClass} mt-1`}
              value={row.amount}
              placeholder="2"
              onChange={(event) =>
                updateLine(index, { ...row, amount: event.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-muted">Unit</label>
            <div className="mt-1">
              <UnitInput
                value={row.unit}
                fixedUnits={units.fixedUnits}
                onChange={(unit) => updateLine(index, { ...row, unit })}
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-ink-muted">
              Ingredient
            </label>
            <input
              className={`${fieldClass} mt-1`}
              value={row.item}
              placeholder="unsalted butter"
              onChange={(event) =>
                updateLine(index, { ...row, item: event.target.value })
              }
            />
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => removeRow(index)}
            className="rounded-full border border-clay/30 px-3 py-1 text-xs text-clay hover:bg-clay/10"
          >
            Remove
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <p className="text-sm text-ink-muted">
          No ingredients yet. Use the + button to add one.
        </p>
      ) : (
        <ReorderList
          listRef={listRef}
          items={value}
          onReorder={onChange}
          renderItem={renderRow}
          className="space-y-3"
        />
      )}
    </div>
  );
}
