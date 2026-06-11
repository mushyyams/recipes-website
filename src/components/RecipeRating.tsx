"use client";

import { useCallback, useEffect, useState } from "react";
import type { RatingSummaryWithUser } from "@/lib/ratings";
import { getOrCreateRaterKey } from "@/lib/rater-key";

type RecipeRatingProps = {
  targetType: "original" | "fork";
  recipeSlug?: string;
  forkId?: string;
  compact?: boolean;
};

const emptySummary: RatingSummaryWithUser = {
  average: null,
  count: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

export function RecipeRating({
  targetType,
  recipeSlug,
  forkId,
  compact = false,
}: RecipeRatingProps) {
  const [summary, setSummary] = useState<RatingSummaryWithUser>(emptySummary);
  const [hover, setHovered] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchSummary = useCallback(async () => {
    const raterKey = getOrCreateRaterKey();
    const params = new URLSearchParams({
      targetType,
      raterKey,
    });
    if (targetType === "original" && recipeSlug) {
      params.set("recipeSlug", recipeSlug);
    }
    if (targetType === "fork" && forkId) {
      params.set("forkId", forkId);
    }

    const response = await fetch(`/api/ratings?${params.toString()}`);
    if (!response.ok) return;

    const data = (await response.json()) as { summary: RatingSummaryWithUser };
    setSummary(data.summary);
    setLoaded(true);
  }, [targetType, recipeSlug, forkId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  async function handleRate(value: number) {
    setSubmitting(true);
    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          recipeSlug,
          forkId,
          rating: value,
          raterKey: getOrCreateRaterKey(),
        }),
      });

      const data = (await response.json()) as {
        summary?: RatingSummaryWithUser;
        error?: string;
      };

      if (response.ok && data.summary) {
        setSummary(data.summary);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const displayValue =
    hover ?? summary.userRating ?? (summary.average ? Math.round(summary.average) : 0);

  return (
    <div
      className={`rounded-[1.25rem] border border-stone bg-cream ${compact ? "p-4" : "p-5"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-sage">
            Rate this recipe
          </p>
          {!compact && (
            <p className="mt-1 text-sm text-ink-muted">
              {summary.count === 0
                ? "Be the first to rate it."
                : `${summary.count} rating${summary.count === 1 ? "" : "s"} so far.`}
            </p>
          )}
        </div>
        {summary.average !== null && (
          <p className="font-display text-2xl font-medium text-ink">
            {summary.average.toFixed(1)}
            <span className="text-sm font-normal text-ink-muted"> / 5</span>
          </p>
        )}
      </div>

      <div
        className="mt-4 flex items-center gap-1"
        onMouseLeave={() => setHovered(null)}
        role="group"
        aria-label="Rate from 1 to 5 stars"
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            disabled={submitting || !loaded}
            onMouseEnter={() => setHovered(value)}
            onClick={() => handleRate(value)}
            className="rounded-md p-1 transition-transform hover:scale-110 disabled:opacity-50"
            aria-label={`Rate ${value} out of 5`}
          >
            <Star filled={value <= displayValue} />
          </button>
        ))}
      </div>

      {summary.userRating && (
        <p className="mt-3 text-xs text-ink-muted">
          You rated this {summary.userRating} star{summary.userRating === 1 ? "" : "s"}.
        </p>
      )}
    </div>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill={filled ? "var(--color-clay)" : "none"}
      stroke="var(--color-clay)"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
