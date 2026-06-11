export function IngredientList({ ingredients }: { ingredients: string[] }) {
  return (
    <div className="rounded-[1.5rem] bg-parchment p-6 md:p-8">
      <h2 className="font-display text-xl font-medium text-ink">Ingredients</h2>
      <ul className="mt-5 space-y-3">
        {ingredients.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-sm leading-relaxed text-ink-muted"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
