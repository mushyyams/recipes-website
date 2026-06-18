"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export type AddSectionId = "ingredients" | "steps" | "notes";

const ADD_SECTION_IDS: AddSectionId[] = ["ingredients", "steps", "notes"];

type SectionRef = {
  id: AddSectionId;
  ref: RefObject<HTMLElement | null>;
};

export function useActiveAddSection(sections: SectionRef[]) {
  const [activeSection, setActiveSection] = useState<AddSectionId | null>(null);
  const ratiosRef = useRef<Record<AddSectionId, number>>({
    ingredients: 0,
    steps: 0,
    notes: 0,
  });

  useEffect(() => {
    const elements = sections
      .map(({ id, ref }) => ({ id, el: ref.current }))
      .filter(
        (entry): entry is { id: AddSectionId; el: HTMLElement } =>
          Boolean(entry.el)
      );

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          const id = target.dataset.addSection as AddSectionId | undefined;
          if (id) {
            ratiosRef.current[id] = entry.intersectionRatio;
          }
        }

        const threshold = 0.1;
        let bestSection: AddSectionId | null = null;
        let bestRatio = threshold;

        for (const id of ADD_SECTION_IDS) {
          const ratio = ratiosRef.current[id];
          if (ratio >= bestRatio) {
            bestRatio = ratio;
            bestSection = id;
          }
        }

        setActiveSection(bestSection);
      },
      {
        threshold: [0, 0.05, 0.1, 0.2, 0.35, 0.5, 0.75, 1],
        rootMargin: "-10% 0px -25% 0px",
      }
    );

    for (const { el } of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sections]);

  return activeSection;
}
