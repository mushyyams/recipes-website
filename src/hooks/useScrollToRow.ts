"use client";

import { useEffect, type RefObject } from "react";

export function useScrollToRow(
  containerRef: RefObject<HTMLDivElement | null>,
  scrollToIndex: number | null | undefined,
  itemCount: number,
  onHandled?: () => void
) {
  useEffect(() => {
    if (
      scrollToIndex == null ||
      scrollToIndex < 0 ||
      scrollToIndex >= itemCount
    ) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;

      const row = container.querySelector(
        `[data-row-index="${scrollToIndex}"]`
      );
      if (!row) return;

      row.scrollIntoView({ behavior: "smooth", block: "center" });

      const focusable = row.querySelector<HTMLElement>(
        "input, textarea, select"
      );
      focusable?.focus({ preventScroll: true });
      onHandled?.();
    });

    return () => cancelAnimationFrame(frame);
  }, [containerRef, scrollToIndex, itemCount, onHandled]);
}
