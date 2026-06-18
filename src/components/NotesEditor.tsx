"use client";

import { useCallback, useRef } from "react";
import { ReorderList } from "@/components/ReorderList";
import { useScrollToRow } from "@/hooks/useScrollToRow";
import {
  isNoteHeader,
  isNoteSection,
  type RecipeNoteBlock,
} from "@/lib/notes";

type NotesEditorProps = {
  value: RecipeNoteBlock[];
  onChange: (blocks: RecipeNoteBlock[]) => void;
  scrollToIndex?: number | null;
  onScrollToIndexHandled?: () => void;
};

export function NotesEditor({
  value,
  onChange,
  scrollToIndex,
  onScrollToIndexHandled,
}: NotesEditorProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useScrollToRow(listRef, scrollToIndex, value.length, onScrollToIndexHandled);

  const updateBlock = useCallback(
    (index: number, nextBlock: RecipeNoteBlock) => {
      onChange(value.map((block, blockIndex) => (blockIndex === index ? nextBlock : block)));
    },
    [onChange, value]
  );

  const removeBlock = useCallback(
    (index: number) => {
      onChange(value.filter((_, blockIndex) => blockIndex !== index));
    },
    [onChange, value]
  );

  const fieldClass =
    "mt-2 w-full rounded-2xl border border-stone bg-cream px-4 py-3 text-sm text-ink outline-none focus:border-sage";

  const renderBlock = (block: RecipeNoteBlock, index: number) => {
    if (isNoteHeader(block)) {
      return (
        <div className="py-1 pt-4">
          <input
            className="w-full border-0 bg-transparent px-0 py-1 font-display text-[1.625rem] font-medium tracking-tight text-ink outline-none placeholder:text-ink/30 focus:ring-0"
            value={block.text}
            placeholder="Section title"
            onChange={(event) =>
              updateBlock(index, { type: "header", text: event.target.value })
            }
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => removeBlock(index)}
              className="rounded-full border border-clay/30 px-3 py-1 text-xs text-clay hover:bg-clay/10"
            >
              Remove
            </button>
          </div>
        </div>
      );
    }

    if (isNoteSection(block)) {
      return (
        <div className="py-1">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-stone-dark/50" aria-hidden />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent px-2 py-1 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-sage outline-none placeholder:text-sage/40 focus:ring-0"
              value={block.text}
              placeholder="Section name"
              onChange={(event) =>
                updateBlock(index, { type: "section", text: event.target.value })
              }
            />
            <span className="h-px flex-1 bg-stone-dark/50" aria-hidden />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => removeBlock(index)}
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
        <textarea
          className={`${fieldClass} mt-0 min-h-28 resize-y leading-relaxed`}
          value={block.text}
          placeholder="Share what you changed, substitutions, tips, or context…"
          onChange={(event) =>
            updateBlock(index, { type: "paragraph", text: event.target.value })
          }
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => removeBlock(index)}
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
          No notes yet. Use the + button to add one.
        </p>
      ) : (
        <ReorderList
          listRef={listRef}
          items={value}
          onReorder={onChange}
          renderItem={renderBlock}
          className="space-y-4"
        />
      )}
    </div>
  );
}
