import Link from "next/link";

type ForkRecipePanelProps = {
  slug: string;
  forkCount: number;
};

export function ForkRecipePanel({ slug, forkCount }: ForkRecipePanelProps) {
  return (
    <div className="mt-6 rounded-[1.5rem] border border-dashed border-sage/40 bg-cream p-6">
      <p className="font-display text-lg font-medium text-ink">Fork this recipe</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Made a tweak? Save your version for others to find — like GitHub, but for
        dinner.
      </p>
      <Link
        href={`/recipes/${slug}/fork`}
        className="mt-4 inline-block rounded-full bg-sage px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-sage-light"
      >
        Create a fork
      </Link>
      {forkCount > 0 && (
        <a
          href="#variations"
          className="mt-3 block text-sm text-clay hover:underline"
        >
          Browse {forkCount} variation{forkCount === 1 ? "" : "s"} ↓
        </a>
      )}
    </div>
  );
}
