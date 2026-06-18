"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useRef, type ReactNode, type RefObject } from "react";

type ReorderListProps<T> = {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  itemClassName?: string;
  listRef?: RefObject<HTMLDivElement | null>;
};

function DragHandle({
  attributes,
  listeners,
}: {
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: ReturnType<typeof useSortable>["listeners"];
}) {
  return (
    <button
      type="button"
      className="mt-1 flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-lg text-ink-muted/50 transition-colors hover:bg-stone/40 hover:text-sage active:cursor-grabbing"
      aria-label="Drag to reorder"
      {...attributes}
      {...listeners}
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden
      >
        <circle cx="5" cy="4" r="1.25" />
        <circle cx="11" cy="4" r="1.25" />
        <circle cx="5" cy="8" r="1.25" />
        <circle cx="11" cy="8" r="1.25" />
        <circle cx="5" cy="12" r="1.25" />
        <circle cx="11" cy="12" r="1.25" />
      </svg>
    </button>
  );
}

function SortableRow({
  id,
  rowIndex,
  className,
  children,
}: {
  id: string;
  rowIndex: number;
  className?: string;
  children: (handle: ReactNode) => ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handle = (
    <DragHandle attributes={attributes} listeners={listeners} />
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-row-index={rowIndex}
      className={`${className ?? ""} ${isDragging ? "z-10 opacity-60" : ""}`}
    >
      {children(handle)}
    </div>
  );
}

function syncItemIds(idsRef: React.RefObject<string[]>, count: number) {
  const ids = idsRef.current;
  while (ids.length < count) {
    ids.push(crypto.randomUUID());
  }
  if (ids.length > count) {
    ids.splice(count);
  }
}

export function ReorderList<T>({
  items,
  onReorder,
  renderItem,
  className,
  itemClassName,
  listRef,
}: ReorderListProps<T>) {
  const idsRef = useRef<string[]>([]);
  syncItemIds(idsRef, items.length);
  const itemIds = idsRef.current;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = itemIds.indexOf(String(active.id));
      const newIndex = itemIds.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;

      idsRef.current = arrayMove(itemIds, oldIndex, newIndex);
      onReorder(arrayMove(items, oldIndex, newIndex));
    },
    [itemIds, items, onReorder]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div ref={listRef} className={className}>
          {items.map((item, index) => (
            <SortableRow
              key={itemIds[index]}
              id={itemIds[index]}
              rowIndex={index}
              className={itemClassName}
            >
              {(handle) => (
                <div className="flex gap-3">
                  {handle}
                  <div className="min-w-0 flex-1">{renderItem(item, index)}</div>
                </div>
              )}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
