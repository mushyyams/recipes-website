"use client";

import { useCallback, useRef } from "react";
import { ReorderList } from "@/components/ReorderList";
import { useScrollToRow } from "@/hooks/useScrollToRow";
import {
  getStepDisplayNumber,
  isMethodSection,
  type RecipeStepLine,
} from "@/lib/steps";

type StepEditorProps = {
  value: RecipeStepLine[];
  onChange: (steps: RecipeStepLine[]) => void;
  scrollToIndex?: number | null;
  onScrollToIndexHandled?: () => void;
};

export function StepEditor({
  value,
  onChange,
  scrollToIndex,
  onScrollToIndexHandled,
}: StepEditorProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useScrollToRow(listRef, scrollToIndex, value.length, onScrollToIndexHandled);

  const fieldClass =
    "mt-2 w-full rounded-2xl border border-stone bg-cream px-4 py-3 text-sm text-ink outline-none focus:border-sage";

  const updateStep = useCallback(
    (index: number, text: string) => {
      onChange(
        value.map((step, stepIndex) => (stepIndex === index ? text : step))
      );
    },
    [onChange, value]
  );

  const updateSection = useCallback(
    (index: number, label: string) => {
      onChange(
        value.map((step, stepIndex) =>
          stepIndex === index ? { type: "section", label } : step
        )
      );
    },
    [onChange, value]
  );

  const removeRow = useCallback(
    (index: number) => {
      onChange(value.filter((_, stepIndex) => stepIndex !== index));
    },
    [onChange, value]
  );

  const renderRow = (line: RecipeStepLine, index: number) => {
    if (isMethodSection(line)) {
      return (
        <div className="py-1">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-stone-dark/50" aria-hidden />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent px-2 py-1 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-sage outline-none placeholder:text-sage/40 focus:ring-0"
              value={line.label}
              placeholder="Section name"
              onChange={(event) => updateSection(index, event.target.value)}
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

    const stepNumber = getStepDisplayNumber(value, index);

    return (
      <div className="rounded-2xl border border-stone bg-parchment/60 p-4">
        <label className="text-sm font-medium text-ink">Step {stepNumber}</label>
        <textarea
          className={`${fieldClass} min-h-24 resize-y`}
          value={line}
          onChange={(event) => updateStep(index, event.target.value)}
          placeholder="Describe what happens in this step…"
        />
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
    <div className="space-y-4">
      {value.length === 0 ? (
        <p className="text-sm text-ink-muted">
          No steps yet. Use the + button to add one.
        </p>
      ) : (
        <ReorderList
          listRef={listRef}
          items={value}
          onReorder={onChange}
          renderItem={renderRow}
          className="space-y-4"
        />
      )}
    </div>
  );
}
