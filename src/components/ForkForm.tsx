"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Recipe } from "@/lib/recipes";

type ForkFormProps = {
  recipe: Recipe;
};

function linesToList(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ForkForm({ recipe }: ForkFormProps) {
  const router = useRouter();
  const [authorName, setAuthorName] = useState("");
  const [title, setTitle] = useState(recipe.title);
  const [excerpt, setExcerpt] = useState(recipe.excerpt);
  const [prepTime, setPrepTime] = useState(recipe.prepTime);
  const [cookTime, setCookTime] = useState(recipe.cookTime);
  const [servings, setServings] = useState(String(recipe.servings));
  const [ingredients, setIngredients] = useState(recipe.ingredients.join("\n"));
  const [steps, setSteps] = useState(recipe.steps.join("\n"));
  const [content, setContent] = useState(recipe.content.trim());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/forks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalSlug: recipe.slug,
          authorName,
          title,
          excerpt,
          prepTime,
          cookTime,
          servings: Number(servings) || undefined,
          ingredients: linesToList(ingredients),
          steps: linesToList(steps),
          content,
        }),
      });

      const data = (await response.json()) as {
        fork?: { id: string };
        error?: string;
      };

      if (!response.ok || !data.fork) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push(`/recipes/${recipe.slug}/forks/${data.fork.id}`);
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass =
    "mt-2 w-full rounded-2xl border border-stone bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-sage";
  const labelClass = "text-sm font-medium text-ink";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-[1.5rem] bg-parchment p-6">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-sage">
          Your fork
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Starting from{" "}
          <span className="font-medium text-ink">{recipe.title}</span>. Change
          whatever you like — ingredients, steps, or the story behind it.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="authorName">
            Your name
          </label>
          <input
            id="authorName"
            className={fieldClass}
            value={authorName}
            onChange={(event) => setAuthorName(event.target.value)}
            placeholder="How should we credit you?"
            maxLength={80}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="title">
            Recipe title
          </label>
          <input
            id="title"
            className={fieldClass}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="excerpt">
            Short description
          </label>
          <textarea
            id="excerpt"
            className={`${fieldClass} min-h-24 resize-y`}
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="prepTime">
            Prep time
          </label>
          <input
            id="prepTime"
            className={fieldClass}
            value={prepTime}
            onChange={(event) => setPrepTime(event.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="cookTime">
            Cook time
          </label>
          <input
            id="cookTime"
            className={fieldClass}
            value={cookTime}
            onChange={(event) => setCookTime(event.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="servings">
            Servings
          </label>
          <input
            id="servings"
            type="number"
            min={1}
            className={fieldClass}
            value={servings}
            onChange={(event) => setServings(event.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="ingredients">
          Ingredients
        </label>
        <p className="mt-1 text-xs text-ink-muted">One per line</p>
        <textarea
          id="ingredients"
          className={`${fieldClass} min-h-48 resize-y font-mono`}
          value={ingredients}
          onChange={(event) => setIngredients(event.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="steps">
          Method
        </label>
        <p className="mt-1 text-xs text-ink-muted">One step per line</p>
        <textarea
          id="steps"
          className={`${fieldClass} min-h-48 resize-y`}
          value={steps}
          onChange={(event) => setSteps(event.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="content">
          Notes &amp; story
        </label>
        <p className="mt-1 text-xs text-ink-muted">
          What did you change and why? Substitutions, tips, context.
        </p>
        <textarea
          id="content"
          className={`${fieldClass} min-h-40 resize-y`}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
      </div>

      {error && (
        <p className="rounded-2xl border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-clay disabled:opacity-60"
        >
          {submitting ? "Publishing fork…" : "Publish fork"}
        </button>
      </div>
    </form>
  );
}
