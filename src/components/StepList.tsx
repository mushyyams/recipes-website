export function StepList({ steps }: { steps: string[] }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-medium text-ink">Method</h2>
      <ol className="mt-6 space-y-8">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage/15 font-display text-sm font-medium text-sage">
              {index + 1}
            </span>
            <p className="pt-1.5 text-base leading-relaxed text-ink-muted">
              {step}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
