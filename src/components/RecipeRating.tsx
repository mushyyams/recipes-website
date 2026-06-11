"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { RatingSummaryWithUser } from "@/lib/ratings";
import { getOrCreateRaterKey } from "@/lib/rater-key";
import {
  getStoredUserRating,
  ratingTargetKey,
  setStoredUserRating,
} from "@/lib/rating-storage";

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

function withStoredUserRating(
  summary: RatingSummaryWithUser,
  storedRating?: number
): RatingSummaryWithUser {
  if (summary.userRating !== undefined) return summary;
  if (storedRating === undefined) return summary;
  return { ...summary, userRating: storedRating };
}

function optimisticSummary(
  current: RatingSummaryWithUser,
  value: number
): RatingSummaryWithUser {
  const previousUserRating = current.userRating;
  const distribution = { ...current.distribution };
  let count = current.count;

  if (previousUserRating !== undefined) {
    distribution[previousUserRating] = Math.max(
      0,
      (distribution[previousUserRating] ?? 0) - 1
    );
  } else {
    count += 1;
  }

  distribution[value] = (distribution[value] ?? 0) + 1;

  const total = Object.entries(distribution).reduce(
    (sum, [stars, amount]) => sum + Number(stars) * amount,
    0
  );
  const average =
    count === 0 ? null : Math.round((total / count) * 10) / 10;

  return {
    average,
    count,
    distribution,
    userRating: value,
  };
}

export function RecipeRating({
  targetType,
  recipeSlug,
  forkId,
  compact = false,
}: RecipeRatingProps) {
  const targetId = targetType === "original" ? recipeSlug : forkId;
  const storageKey = useMemo(
    () => (targetId ? ratingTargetKey(targetType, targetId) : ""),
    [targetType, targetId]
  );

  const [summary, setSummary] = useState<RatingSummaryWithUser>(() => {
    if (!storageKey) return emptySummary;
    const storedRating = getStoredUserRating(storageKey);
    return withStoredUserRating(emptySummary, storedRating);
  });
  const [hover, setHover] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!targetId) return;

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
    const storedRating = getStoredUserRating(storageKey);
    const merged = withStoredUserRating(data.summary, storedRating);

    if (merged.userRating !== undefined) {
      setStoredUserRating(storageKey, merged.userRating);
    }

    setSummary(merged);
    setLoaded(true);
  }, [targetType, recipeSlug, forkId, targetId, storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    const storedRating = getStoredUserRating(storageKey);
    if (storedRating !== undefined) {
      setSummary((current) => withStoredUserRating(current, storedRating));
    }
  }, [storageKey]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  async function handleRate(value: number) {
    if (!storageKey) return;

    setSaveError(null);
    setStoredUserRating(storageKey, value);
    setSummary((current) => optimisticSummary(current, value));
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
        setSummary(withStoredUserRating(data.summary, value));
        if (data.summary.userRating !== undefined) {
          setStoredUserRating(storageKey, data.summary.userRating);
        }
        return;
      }

      setSaveError(
        data.error ??
          "Could not save your rating yet. Your stars are saved on this device."
      );
    } catch {
      setSaveError(
        "Could not reach the server. Your stars are saved on this device."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const displayValue = hover ?? summary.userRating ?? 0;
  const countLabel =
    summary.count === 0
      ? "Be the first to rate"
      : `${summary.count} ${summary.count === 1 ? "rating" : "ratings"}`;

  return (
    <div
      className={`rounded-[1.25rem] border border-stone bg-cream ${compact ? "p-4" : "p-5"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-sage">
            Rate this recipe
          </p>
          <p className="mt-1 text-sm text-ink-muted">{countLabel}</p>
        </div>
        {summary.average !== null && summary.count > 0 && (
          <p className="font-display text-2xl font-medium text-ink">
            {summary.average.toFixed(1)}
            <span className="text-sm font-normal text-ink-muted"> / 5</span>
          </p>
        )}
      </div>

      <div
        className="mt-4 flex items-center gap-1"
        onMouseLeave={() => setHover(null)}
        role="group"
        aria-label="Rate from 1 to 5 stars"
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            disabled={submitting && !summary.userRating}
            onMouseEnter={() => setHover(value)}
            onClick={() => handleRate(value)}
            className="rounded-md p-1 transition-transform hover:scale-110 disabled:opacity-70"
            aria-label={`Rate ${value} out of 5`}
            aria-pressed={summary.userRating === value}
          >
            <Star filled={value <= displayValue} />
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
        {summary.userRating !== undefined && (
          <span className="font-medium text-ink">
            Your rating: {summary.userRating} star
            {summary.userRating === 1 ? "" : "s"}
          </span>
        )}
        {submitting && <span>Saving…</span>}
        {!loaded && !submitting && (
          <span>Loading community ratings…</span>
        )}
      </div>

      {saveError && (
        <p className="mt-3 rounded-xl border border-clay/30 bg-clay/10 px-3 py-2 text-xs text-clay">
          {saveError}
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
