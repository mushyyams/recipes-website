export type MethodSection = {
  type: "section";
  label: string;
};

export type RecipeStepLine = string | MethodSection;

function isSectionMarkerType(type: unknown): type is "section" | "subheader" {
  return type === "section" || type === "subheader";
}

export function isMethodSection(line: RecipeStepLine): line is MethodSection {
  return typeof line === "object" && line !== null && isSectionMarkerType(line.type);
}

/** @deprecated Use isMethodSection */
export const isMethodSubheader = isMethodSection;

export function emptyMethodSection(): MethodSection {
  return { type: "section", label: "" };
}

/** @deprecated Use emptyMethodSection */
export const emptyMethodSubheader = emptyMethodSection;

export function normalizeStepLine(raw: unknown): RecipeStepLine | null {
  if (typeof raw === "string") {
    const text = raw.trim();
    return text ? text : null;
  }

  if (typeof raw === "object" && raw !== null) {
    const value = raw as Record<string, unknown>;

    if (isSectionMarkerType(value.type)) {
      const label = String(value.label ?? "").trim();
      return label ? { type: "section", label } : null;
    }

    const text = String(value.step ?? value.text ?? "").trim();
    return text ? text : null;
  }

  return null;
}

export function normalizeSteps(raw: unknown[]): RecipeStepLine[] {
  return raw
    .map((entry) => normalizeStepLine(entry))
    .filter((entry): entry is RecipeStepLine => entry !== null);
}

export function getMethodSteps(lines: RecipeStepLine[]): string[] {
  return lines
    .filter((line): line is string => typeof line === "string")
    .map((step) => step.trim())
    .filter(Boolean);
}

export function getStepDisplayNumber(
  lines: RecipeStepLine[],
  index: number
): number {
  let number = 0;
  for (let i = 0; i <= index; i++) {
    if (!isMethodSection(lines[i])) number += 1;
  }
  return number;
}
