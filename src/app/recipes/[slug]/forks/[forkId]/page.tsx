import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { IngredientList } from "@/components/IngredientList";
import { StepList } from "@/components/StepList";
import { getForkById } from "@/lib/forks";
import { getRecipeBySlug } from "@/lib/recipes";

type PageProps = {
  params: Promise<{ slug: string; forkId: string }>;
};

export const revalidate = 30;

export async function generateMetadata({ params }: PageProps) {
  const { forkId } = await params;
  const fork = await getForkById(forkId);
  if (!fork) return {};

  return {
    title: `${fork.title} (fork)`,
    description: fork.excerpt,
  };
}

export default async function ForkPage({ params }: PageProps) {
  const { slug, forkId } = await params;
  const [recipe, fork] = await Promise.all([
    getRecipeBySlug(slug),
    getForkById(forkId),
  ]);

  if (!recipe || !fork || fork.originalSlug !== slug) notFound();

  const formattedDate = new Date(fork.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article>
      <div className="border-b border-stone bg-parchment">
        <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-sage">
            Community fork
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            A variation of{" "}
            <Link
              href={`/recipes/${recipe.slug}`}
              className="font-medium text-clay hover:underline"
            >
              {recipe.title}
            </Link>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <header className="mx-auto max-w-3xl pt-12 md:pt-16">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.15em] text-ink-muted">
            <span>Fork</span>
            <span className="h-1 w-1 rounded-full bg-clay" />
            <time dateTime={fork.createdAt}>{formattedDate}</time>
          </div>

          <h1 className="mt-5 font-display text-4xl font-medium leading-[1.1] tracking-tight text-ink md:text-5xl">
            {fork.title}
          </h1>

          <p className="mt-6 text-xl leading-relaxed text-ink-muted">
            {fork.excerpt}
          </p>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-clay/15 font-display text-sm font-medium text-clay">
              {fork.authorName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-ink">{fork.authorName}</p>
              <p className="text-xs text-ink-muted">Forked this recipe</p>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-12 py-12 lg:grid-cols-[1fr_340px] lg:gap-16 lg:py-16">
          <div className="order-2 lg:order-1">
            <StepList steps={fork.steps} />

            {fork.content.trim() && (
              <div className="prose-recipe mt-16 border-t border-stone pt-12">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {fork.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          <aside className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-24 space-y-6">
              <IngredientList ingredients={fork.ingredients} />

              <div className="rounded-[1.5rem] border border-stone bg-cream p-6">
                <p className="font-display text-lg font-medium text-ink">
                  Based on the original
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  This is a community variation, not the official recipe.
                </p>
                <Link
                  href={`/recipes/${recipe.slug}`}
                  className="mt-4 inline-block text-sm font-medium text-clay hover:underline"
                >
                  View original →
                </Link>
                <Link
                  href={`/recipes/${recipe.slug}/fork`}
                  className="mt-3 block text-sm font-medium text-sage hover:underline"
                >
                  Fork it yourself →
                </Link>
              </div>
            </div>
          </aside>
        </div>

        <div className="mx-auto max-w-3xl border-t border-stone pb-16 pt-10">
          <Link
            href={`/recipes/${recipe.slug}`}
            className="text-sm font-medium text-clay hover:underline"
          >
            ← Back to {recipe.title}
          </Link>
        </div>
      </div>
    </article>
  );
}
