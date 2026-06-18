"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import type { RecipeIngredientLine } from "@/lib/ingredients";
import {
  emptyIngredient,
  emptyIngredientSection,
  getIngredientItems,
  isIngredientSection,
} from "@/lib/ingredients";
import {
  emptyMethodSection,
  getMethodSteps,
  isMethodSection,
  type RecipeStepLine,
} from "@/lib/steps";
import {
  emptyNoteHeader,
  emptyNoteParagraph,
  emptyNoteSection,
  parseNotesMarkdown,
  serializeNotesMarkdown,
  type RecipeNoteBlock,
} from "@/lib/notes";
import {
  RECIPE_CATEGORIES,
  RECIPE_DIFFICULTIES,
  slugifyRecipeTitle,
  type RecipeDifficulty,
} from "@/lib/recipe-meta";
import { FloatingAddToolbar } from "@/components/FloatingAddToolbar";
import { IngredientEditor } from "@/components/IngredientEditor";
import { NotesEditor } from "@/components/NotesEditor";
import { RecipePreviewModal } from "@/components/RecipePreviewModal";
import { StepEditor } from "@/components/StepEditor";
import { TimeInput } from "@/components/TimeInput";
import { useActiveAddSection } from "@/hooks/useActiveAddSection";

export function RecipeSubmissionForm() {
  const router = useRouter();
  const [authorName, setAuthorName] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState<string>(RECIPE_CATEGORIES[0]);
  const [tagsInput, setTagsInput] = useState("");
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>("Medium");
  const [prepTime, setPrepTime] = useState("10 min");
  const [cookTime, setCookTime] = useState("20 min");
  const [servings, setServings] = useState("4");
  const [image, setImage] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [video, setVideo] = useState("");
  const [ingredients, setIngredients] = useState<RecipeIngredientLine[]>([
    emptyIngredient(),
  ]);
  const [steps, setSteps] = useState<RecipeStepLine[]>([""]);
  const [noteBlocks, setNoteBlocks] = useState<RecipeNoteBlock[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [ingredientScrollToIndex, setIngredientScrollToIndex] = useState<
    number | null
  >(null);
  const [stepScrollToIndex, setStepScrollToIndex] = useState<number | null>(
    null
  );
  const [noteScrollToIndex, setNoteScrollToIndex] = useState<number | null>(
    null
  );
  const formRef = useRef<HTMLFormElement>(null);
  const ingredientsSectionRef = useRef<HTMLElement>(null);
  const stepsSectionRef = useRef<HTMLElement>(null);
  const notesSectionRef = useRef<HTMLElement>(null);

  const sectionRefs = useMemo(
    () => [
      { id: "ingredients" as const, ref: ingredientsSectionRef },
      { id: "steps" as const, ref: stepsSectionRef },
      { id: "notes" as const, ref: notesSectionRef },
    ],
    []
  );

  const activeAddSection = useActiveAddSection(sectionRefs);

  const activeSectionRef =
    activeAddSection === "notes"
      ? notesSectionRef
      : activeAddSection === "steps"
        ? stepsSectionRef
        : activeAddSection === "ingredients"
          ? ingredientsSectionRef
          : undefined;

  function handleTitleChange(nextTitle: string) {
    setTitle(nextTitle);
    if (!slugTouched) {
      setSlug(slugifyRecipeTitle(nextTitle));
    }
  }

  const addIngredient = useCallback(() => {
    setIngredients((current) => {
      setIngredientScrollToIndex(current.length);
      return [...current, emptyIngredient()];
    });
  }, []);

  const addIngredientSection = useCallback(() => {
    setIngredients((current) => {
      setIngredientScrollToIndex(current.length);
      return [...current, emptyIngredientSection()];
    });
  }, []);

  const addStep = useCallback(() => {
    setSteps((current) => {
      setStepScrollToIndex(current.length);
      return [...current, ""];
    });
  }, []);

  const addStepSection = useCallback(() => {
    setSteps((current) => {
      setStepScrollToIndex(current.length);
      return [...current, emptyMethodSection()];
    });
  }, []);

  const addNoteParagraph = useCallback(() => {
    setNoteBlocks((current) => {
      setNoteScrollToIndex(current.length);
      return [...current, emptyNoteParagraph()];
    });
  }, []);

  const addNoteHeader = useCallback(() => {
    setNoteBlocks((current) => {
      setNoteScrollToIndex(current.length);
      return [...current, emptyNoteHeader()];
    });
  }, []);

  const addNoteSection = useCallback(() => {
    setNoteBlocks((current) => {
      setNoteScrollToIndex(current.length);
      return [...current, emptyNoteSection()];
    });
  }, []);

  const addToolbarOptions = useMemo(() => {
    if (activeAddSection === "notes") {
      return [
        { label: "Add paragraph", onSelect: addNoteParagraph },
        { label: "Add header", onSelect: addNoteHeader },
        { label: "Add section", onSelect: addNoteSection },
      ];
    }

    if (activeAddSection === "steps") {
      return [
        { label: "Add step", onSelect: addStep },
        { label: "Add section", onSelect: addStepSection },
      ];
    }

    return [
      { label: "Add ingredient", onSelect: addIngredient },
      { label: "Add section", onSelect: addIngredientSection },
    ];
  }, [
    activeAddSection,
    addIngredient,
    addIngredientSection,
    addNoteHeader,
    addNoteParagraph,
    addNoteSection,
    addStep,
    addStepSection,
  ]);

  const addToolbarAriaLabel = useMemo(() => {
    if (activeAddSection === "notes") {
      return "Add paragraph, header, or section";
    }
    if (activeAddSection === "steps") {
      return "Add step or section";
    }
    return "Add ingredient or section";
  }, [activeAddSection]);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName,
          title,
          slug,
          excerpt,
          category,
          tags,
          difficulty,
          prepTime,
          cookTime,
          servings: Number(servings) || undefined,
          image: image.trim() || undefined,
          imageAlt: imageAlt.trim() || undefined,
          video: video.trim() || undefined,
          ingredients,
          steps: steps.filter((entry) =>
            isMethodSection(entry)
              ? entry.label.trim()
              : typeof entry === "string" && entry.trim()
          ),
          content: serializeNotesMarkdown(noteBlocks),
        }),
      });

      const data = (await response.json()) as {
        submission?: { id: string };
        error?: string;
      };

      if (!response.ok || !data.submission) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push("/submit/success");
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
      setPreviewOpen(false);
    }
  }

  function handlePreview(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!authorName.trim()) {
      setError("Please enter your name before previewing.");
      return;
    }
    if (!title.trim() || !excerpt.trim()) {
      setError("Title and short description are required.");
      return;
    }
    if (!slug.trim()) {
      setError("URL slug is required.");
      return;
    }
    if (getIngredientItems(ingredients).length === 0) {
      setError("Add at least one ingredient.");
      return;
    }
    if (getMethodSteps(steps).length === 0) {
      setError("Add at least one step.");
      return;
    }

    setPreviewOpen(true);
  }

  const fieldClass =
    "mt-2 w-full rounded-2xl border border-stone bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-sage";
  const labelClass = "text-sm font-medium text-ink";
  const sectionClass =
    "space-y-6 rounded-[1.5rem] border border-stone bg-parchment/40 p-6";
  const sectionLabelClass =
    "text-xs font-medium uppercase tracking-[0.15em] text-sage";
  const hintClass = "mt-1 text-xs text-ink-muted";

  return (
    <>
      <form ref={formRef} onSubmit={handlePreview} className="space-y-8">
        <section className={sectionClass}>
          <p className={sectionLabelClass}>About you</p>

          <div>
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
        </section>

        <section className={sectionClass}>
          <p className={sectionLabelClass}>Recipe details</p>

          <div>
            <label className={labelClass} htmlFor="title">
              Recipe title
            </label>
            <input
              id="title"
              className={fieldClass}
              value={title}
              onChange={(event) => handleTitleChange(event.target.value)}
              required
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="slug">
              URL slug
            </label>
            <input
              id="slug"
              className={fieldClass}
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value.toLowerCase());
              }}
              placeholder="honey-garlic-salmon"
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              required
            />
            <p className={hintClass}>
              Lowercase letters, numbers, and hyphens only. Used in the recipe
              URL if published.
            </p>
          </div>

          <div>
            <label className={labelClass} htmlFor="excerpt">
              Short description
            </label>
            <textarea
              id="excerpt"
              className={`${fieldClass} min-h-24 resize-y`}
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              placeholder="One compelling sentence for cards and search results"
              required
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="category">
                Category
              </label>
              <select
                id="category"
                className={fieldClass}
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                required
              >
                {RECIPE_CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="difficulty">
                Difficulty
              </label>
              <select
                id="difficulty"
                className={fieldClass}
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(event.target.value as RecipeDifficulty)
                }
              >
                {RECIPE_DIFFICULTIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="tags">
              Tags
            </label>
            <input
              id="tags"
              className={fieldClass}
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder="vegetarian, quick, comfort food"
            />
            <p className={hintClass}>Separate tags with commas.</p>
          </div>
        </section>

        <section className={sectionClass}>
          <p className={sectionLabelClass}>Timing</p>

          <div className="grid gap-6 md:grid-cols-3">
            <TimeInput
              id="prepTime"
              label="Prep time"
              value={prepTime}
              onChange={setPrepTime}
            />

            <TimeInput
              id="cookTime"
              label="Cook time"
              value={cookTime}
              onChange={setCookTime}
            />

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
        </section>

        <section className={sectionClass}>
          <p className={sectionLabelClass}>Media (optional)</p>

          <div>
            <label className={labelClass} htmlFor="image">
              Cover image URL
            </label>
            <input
              id="image"
              className={fieldClass}
              value={image}
              onChange={(event) => setImage(event.target.value)}
              placeholder="/images/recipes/your-photo.jpeg"
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="imageAlt">
              Image description
            </label>
            <input
              id="imageAlt"
              className={fieldClass}
              value={imageAlt}
              onChange={(event) => setImageAlt(event.target.value)}
              placeholder="Describe the photo for accessibility"
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="video">
              TikTok or video link
            </label>
            <input
              id="video"
              className={fieldClass}
              value={video}
              onChange={(event) => setVideo(event.target.value)}
              placeholder="https://www.tiktok.com/..."
            />
          </div>
        </section>

        <section
          ref={ingredientsSectionRef}
          data-add-section="ingredients"
          className={sectionClass}
        >
          <p className={sectionLabelClass}>Ingredients</p>
          <IngredientEditor
            value={ingredients}
            onChange={setIngredients}
            scrollToIndex={ingredientScrollToIndex}
            onScrollToIndexHandled={() => setIngredientScrollToIndex(null)}
          />
        </section>

        <section
          ref={stepsSectionRef}
          data-add-section="steps"
          className={sectionClass}
        >
          <p className={sectionLabelClass}>The Recipe</p>
          <StepEditor
            value={steps}
            onChange={setSteps}
            scrollToIndex={stepScrollToIndex}
            onScrollToIndexHandled={() => setStepScrollToIndex(null)}
          />
        </section>

        <section
          ref={notesSectionRef}
          data-add-section="notes"
          className={sectionClass}
        >
          <p className={sectionLabelClass}>Notes &amp; story</p>
          <NotesEditor
            value={noteBlocks}
            onChange={setNoteBlocks}
            scrollToIndex={noteScrollToIndex}
            onScrollToIndexHandled={() => setNoteScrollToIndex(null)}
          />
        </section>

        {error && (
          <p className="rounded-2xl border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-4">
          <button
            type="submit"
            className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-clay"
          >
            Preview submission
          </button>
        </div>
      </form>

      <FloatingAddToolbar
        key={activeAddSection ?? "hidden"}
        anchorRef={formRef}
        verticalAnchorRef={activeSectionRef}
        visible={activeAddSection !== null}
        ariaLabel={addToolbarAriaLabel}
        options={addToolbarOptions}
      />

      <RecipePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onConfirm={handleSubmit}
        confirming={submitting}
        confirmLabel="Submit for review"
        previewTitle="Review before submitting"
        title={title}
        excerpt={excerpt}
        authorName={authorName}
        prepTime={prepTime}
        cookTime={cookTime}
        servings={servings}
        ingredients={ingredients.filter((entry) =>
          isIngredientSection(entry)
            ? entry.label.trim()
            : entry.item.trim() || entry.amount.trim() || entry.unit.trim()
        )}
        steps={steps.filter((entry) =>
          isMethodSection(entry)
            ? entry.label.trim()
            : typeof entry === "string" && entry.trim()
        )}
        content={serializeNotesMarkdown(noteBlocks)}
      />
    </>
  );
}
