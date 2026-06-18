"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export type FloatingAddOption = {
  label: string;
  onSelect: () => void;
};

const TOOLBAR_WIDTH = 40;
const TOOLBAR_HEIGHT = 64;
const TOOLBAR_GAP = 12;
const SECTION_TRAVEL_FRACTION = 14 / 16;

function getSectionClampedTop(sectionRect: DOMRect) {
  const idealTop = window.innerHeight / 2 - TOOLBAR_HEIGHT / 2;
  const minTop = sectionRect.top;
  const travelEnd = sectionRect.top + sectionRect.height * SECTION_TRAVEL_FRACTION;
  const maxTop = travelEnd - TOOLBAR_HEIGHT;

  if (maxTop <= minTop) {
    const travelHeight = sectionRect.height * SECTION_TRAVEL_FRACTION;
    return minTop + (travelHeight - TOOLBAR_HEIGHT) / 2;
  }

  return Math.max(minTop, Math.min(maxTop, idealTop));
}

function getSectionEdgeOpacity(sectionRect: DOMRect) {
  const fadePx = Math.min(96, Math.max(40, sectionRect.height * 0.1));
  const centerY = window.innerHeight / 2;
  const fromTop = centerY - sectionRect.top;
  const travelEndY =
    sectionRect.top + sectionRect.height * SECTION_TRAVEL_FRACTION;
  const fromTravelEnd = travelEndY - centerY;
  const minOpacity = 0.22;

  const topFactor = Math.min(1, Math.max(0, fromTop / fadePx));
  const bottomFactor = Math.min(1, Math.max(0, fromTravelEnd / fadePx));
  const edgeFactor = Math.min(topFactor, bottomFactor);

  return minOpacity + (1 - minOpacity) * edgeFactor;
}

function useToolbarPosition(
  horizontalAnchorRef: RefObject<HTMLElement | null> | undefined,
  verticalAnchorRef: RefObject<HTMLElement | null> | undefined
) {
  const [placement, setPlacement] = useState<{
    left: number;
    top: number;
    opacity: number;
  } | null>(null);

  useEffect(() => {
    const horizontal = horizontalAnchorRef?.current;
    if (!horizontal) return;

    function update() {
      const horizontalEl = horizontalAnchorRef?.current;
      const verticalEl = verticalAnchorRef?.current;
      if (!horizontalEl) return;

      const horizontalRect = horizontalEl.getBoundingClientRect();
      const left = Math.max(
        8,
        horizontalRect.left - TOOLBAR_WIDTH - TOOLBAR_GAP
      );

      let top: number;
      let opacity = 1;
      if (verticalEl) {
        const sectionRect = verticalEl.getBoundingClientRect();
        top = getSectionClampedTop(sectionRect);
        opacity = getSectionEdgeOpacity(sectionRect);
      } else {
        top = window.innerHeight / 2 - TOOLBAR_HEIGHT / 2;
      }

      setPlacement({ left, top, opacity });
    }

    update();
    const observer = new ResizeObserver(update);
    observer.observe(horizontal);
    if (verticalAnchorRef?.current) {
      observer.observe(verticalAnchorRef.current);
    }
    observer.observe(document.documentElement);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [horizontalAnchorRef, verticalAnchorRef]);

  return placement;
}

type FloatingAddToolbarProps = {
  options: FloatingAddOption[];
  visible: boolean;
  anchorRef?: RefObject<HTMLElement | null>;
  verticalAnchorRef?: RefObject<HTMLElement | null>;
  ariaLabel?: string;
};

export function FloatingAddToolbar({
  options,
  visible,
  anchorRef,
  verticalAnchorRef,
  ariaLabel = "Add to list",
}: FloatingAddToolbarProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const placement = useToolbarPosition(anchorRef, verticalAnchorRef);
  const edgeOpacity = placement?.opacity ?? 1;
  const displayOpacity = visible ? (open ? 1 : edgeOpacity) : 0;

  useEffect(() => {
    if (!visible) setOpen(false);
  }, [visible]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div
      className={`fixed z-30 ${
        visible && (open || edgeOpacity > 0.35)
          ? ""
          : "pointer-events-none"
      } ${placement === null ? "left-6 top-1/2 -translate-y-1/2" : ""}`}
      style={
        placement !== null
          ? {
              left: placement.left,
              top: placement.top,
              opacity: displayOpacity,
              transition: "opacity 120ms ease-out",
            }
          : {
              opacity: displayOpacity,
              transition: "opacity 120ms ease-out",
            }
      }
    >
      <div ref={rootRef} className="relative">
        {open && visible ? (
          <div
            role="menu"
            className="absolute left-full top-1/2 ml-3 min-w-[11.5rem] -translate-y-1/2 overflow-hidden rounded-2xl border border-stone bg-cream py-1 shadow-lg"
          >
            {options.map((option) => (
              <button
                key={option.label}
                type="button"
                role="menuitem"
                className="block w-full px-4 py-2.5 text-left text-sm text-ink transition-colors hover:bg-parchment"
                onClick={() => {
                  option.onSelect();
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={ariaLabel}
          tabIndex={visible ? 0 : -1}
          onClick={() => setOpen((current) => !current)}
          className={`flex h-16 w-10 flex-col items-center justify-center gap-0.5 rounded-2xl border shadow-md transition-colors ${
            open
              ? "border-sage bg-sage text-cream hover:bg-sage"
              : "border-stone-dark bg-parchment text-ink hover:border-sage hover:text-sage"
          }`}
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M10 4v12M4 10h12" />
          </svg>
          <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
            Add
          </span>
        </button>
      </div>
    </div>
  );
}
