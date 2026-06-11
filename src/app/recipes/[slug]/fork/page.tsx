import Link from "next/link";
import { notFound } from "next/navigation";
import { ForkForm } from "@/components/ForkForm";
import { getRecipeBySlug } from "@/lib/recipes";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);
  if (!recipe) return {};

  return {
    title: `Fork ${recipe.title}`,
    description: `Create your variation of ${recipe.title}.`,
  };
}

export default async function ForkRecipePage({ params }: PageProps) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);
  if (!recipe) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8 lg:py-24">
      <Link
        href={`/recipes/${recipe.slug}`}
        className="text-sm font-medium text-clay hover:underline"
      >
        ← Back to original recipe
      </Link>

      <header className="mt-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-sage">
          Fork recipe
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-ink">
          Your version of {recipe.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">
          Tweak the recipe, add your notes, and publish a variation others can
          discover from the original article.
        </p>
      </header>

      <div className="mt-10">
        <ForkForm recipe={recipe} />
      </div>
    </div>
  );
}
