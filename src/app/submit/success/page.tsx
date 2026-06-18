import Link from "next/link";

export const metadata = {
  title: "Recipe submitted",
  robots: { index: false, follow: false },
};

export default function SubmitSuccessPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center lg:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-sage">
        Thank you
      </p>
      <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-ink">
        Your recipe is in review
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-muted">
        We received your submission and will take a look soon. If it&apos;s a
        good fit, we&apos;ll publish it on the site and credit you as the
        author.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/recipes"
          className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-clay"
        >
          Browse recipes
        </Link>
        <Link
          href="/submit"
          className="rounded-full border border-stone-dark px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-sage hover:text-sage"
        >
          Submit another
        </Link>
      </div>
    </div>
  );
}
