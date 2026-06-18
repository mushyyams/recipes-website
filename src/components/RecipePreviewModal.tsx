"use client";

import type { RecipeIngredientLine } from "@/lib/ingredients";
import type { RecipeStepLine } from "@/lib/steps";
import { IngredientList } from "@/components/IngredientList";
import { NotesContent } from "@/components/NotesContent";
import { StepList } from "@/components/StepList";

type RecipePreviewModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirming?: boolean;
  title: string;
  excerpt: string;
  authorName?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  ingredients: RecipeIngredientLine[];
  steps: RecipeStepLine[];
  content: string;
};

export function RecipePreviewModal({
  open,
  onClose,
  onConfirm,
  confirming = false,
  title,
  excerpt,
  authorName,
  prepTime,
  cookTime,
  servings,
  ingredients,
  steps,
  content,
}: RecipePreviewModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[1.5rem] bg-cream shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-stone bg-cream px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-sage">
              Preview
            </p>
            <h2 className="font-display text-2xl font-medium text-ink">
              Review before publishing
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-stone px-3 py-1 text-sm text-ink-muted hover:border-clay hover:text-clay"
          >
            Back to edit
          </button>
        </div>

        <div className="space-y-8 px-6 py-8">
          <header>
            {authorName ? (
              <p className="text-sm text-ink-muted">By {authorName}</p>
            ) : null}
            <h3 className="mt-2 font-display text-3xl font-medium text-ink">
              {title}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-ink-muted">
              {excerpt}
            </p>
            {(prepTime || cookTime || servings) && (
              <p className="mt-4 text-sm text-ink-muted">
                {[prepTime && `Prep ${prepTime}`, cookTime && `Cook ${cookTime}`, servings && `${servings} servings`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </header>

          <IngredientList ingredients={ingredients} />
          <StepList steps={steps.filter(Boolean)} />

          {content.trim() ? (
            <div className="rounded-[1.5rem] border border-stone bg-parchment p-6">
              <h4 className="font-display text-lg font-medium text-ink">
                Notes &amp; story
              </h4>
              <div className="mt-3">
                <NotesContent content={content} />
              </div>
            </div>
          ) : null}
        </div>

        <div className="sticky bottom-0 flex flex-wrap gap-3 border-t border-stone bg-cream px-6 py-4">
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream hover:bg-clay disabled:opacity-60"
          >
            {confirming ? "Publishing…" : "Publish fork"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-stone px-6 py-3 text-sm text-ink-muted hover:border-clay hover:text-clay"
          >
            Keep editing
          </button>
        </div>
      </div>
    </div>
  );
}
