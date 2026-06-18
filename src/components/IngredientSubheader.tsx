type IngredientSubheaderProps = {
  label: string;
};

export function IngredientSubheader({ label }: IngredientSubheaderProps) {
  return (
    <div
      className="flex items-center gap-3 pt-5 first:pt-0"
      role="presentation"
    >
      <span className="h-px flex-1 bg-stone-dark/60" aria-hidden />
      <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.16em] text-sage">
        {label}
      </span>
      <span className="h-px flex-1 bg-stone-dark/60" aria-hidden />
    </div>
  );
}
