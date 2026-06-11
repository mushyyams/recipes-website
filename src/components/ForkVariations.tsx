"use client";

import Link from "next/link";
import { useState } from "react";
import type { RecipeFork } from "@/lib/forks";
import { summarizeForkChanges } from "@/lib/fork-utils";
import type { RecipeMeta } from "@/lib/recipes";

type ForkVariationsProps = {
  recipe: RecipeMeta;
  forks: RecipeFork[];
};

export function ForkVariations({ recipe, forks }: ForkVariationsProps) {
  const [open, setOpen] = useState(false);

  if (forks.length === 0) return null;

  return (
    <section
      id="variations"
      className="mx-auto max-w-3xl border-t border-stone pt-10"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 rounded-[1.25rem] bg-parchment px-5 py-4 text-left transition-colors hover:bg-stone/40"
        aria-expanded={open}
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-sage">
            Community variations
          </p>
          <p className="mt-1 font-display text-xl font-medium text-ink">
            {forks.length} fork{forks.length === 1 ? "" : "s"} of this recipe
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Home cooks sharing their twists — tucked away until you want them.
          </p>
        </div>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-lg text-clay transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          ↓
        </span>
      </button>

      {open && (
        <ul className="mt-4 space-y-3">
          {forks.map((fork) => (
            <li key={fork.id}>
              <Link
                href={`/recipes/${recipe.slug}/forks/${fork.id}`}
                className="group block rounded-[1.25rem] border border-stone bg-cream px-5 py-4 transition-colors hover:border-clay/30 hover:bg-parchment"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-ink-muted">
                      by{" "}
                      <span className="font-medium text-ink">
                        {fork.authorName}
                      </span>
                    </p>
                    <p className="mt-1 font-display text-lg font-medium text-ink transition-colors group-hover:text-clay">
                      {fork.title}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">
                      {fork.excerpt}
                    </p>
                    <p className="mt-2 text-xs text-sage">
                      {summarizeForkChanges(recipe, fork)}
                    </p>
                  </div>
                  <span className="shrink-0 pt-1 text-sm text-clay opacity-0 transition-opacity group-hover:opacity-100">
                    View →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
