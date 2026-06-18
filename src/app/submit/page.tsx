import Link from "next/link";
import { RecipeSubmissionForm } from "@/components/RecipeSubmissionForm";

export const metadata = {
  title: "Submit a recipe",
  description:
    "Share your recipe with the community. Submissions are reviewed before publishing.",
};

export default function SubmitRecipePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8 lg:py-24">
      <Link
        href="/recipes"
        className="text-sm font-medium text-clay hover:underline"
      >
        ← Browse recipes
      </Link>

      <header className="mt-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-sage">
          Community submission
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-ink">
          Add your recipe
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">
          No account needed. Fill out the form below and we&apos;ll review your
          recipe before it goes live on the site.
        </p>
      </header>

      <div className="mt-10">
        <RecipeSubmissionForm />
      </div>
    </div>
  );
}
