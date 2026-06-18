export type StructuredIngredient = {
  amount: string;
  unit: string;
  item: string;
};

export type IngredientSection = {
  type: "section";
  label: string;
};

export type RecipeIngredientLine = StructuredIngredient | IngredientSection;

export const OTHER_UNIT_VALUE = "__other__";

const LEGACY_SECTION_PATTERN =
  /(?:Ingredients|Fixings|Salt and Oil)$/i;

function isSectionMarkerType(type: unknown): type is "section" | "subheader" {
  return type === "section" || type === "subheader";
}

export function isIngredientSection(
  line: RecipeIngredientLine
): line is IngredientSection {
  return "type" in line && isSectionMarkerType(line.type);
}

/** @deprecated Use isIngredientSection */
export const isIngredientSubheader = isIngredientSection;

export function isStructuredIngredient(
  line: RecipeIngredientLine
): line is StructuredIngredient {
  return !isIngredientSection(line);
}

/** @deprecated Use isIngredientSection — kept for legacy markdown rows */
export function isSectionHeader(ingredient: StructuredIngredient): boolean {
  const { amount, unit, item } = ingredient;
  if (amount.trim() || unit.trim()) return false;
  const trimmed = item.trim();
  if (!trimmed) return false;
  return LEGACY_SECTION_PATTERN.test(trimmed);
}

export function formatIngredient(ingredient: StructuredIngredient): string {
  const amount = ingredient.amount.trim();
  const unit = ingredient.unit.trim();
  const item = ingredient.item.trim();

  const parts: string[] = [];
  if (amount) parts.push(amount);
  if (unit) parts.push(unit);
  if (item) parts.push(item);

  return parts.join(" ").trim();
}

export function normalizeIngredientLine(
  raw: unknown
): RecipeIngredientLine | null {
  if (typeof raw === "string") {
    const parsed = parseLegacyIngredient(raw);
    if (isSectionHeader(parsed)) {
      return { type: "section", label: parsed.item.trim() };
    }
    return parsed.item.trim() || parsed.amount.trim() || parsed.unit.trim()
      ? parsed
      : null;
  }

  if (typeof raw === "object" && raw !== null) {
    const value = raw as Record<string, unknown>;

    if (isSectionMarkerType(value.type)) {
      const label = String(value.label ?? "").trim();
      return label ? { type: "section", label } : null;
    }

    const ingredient: StructuredIngredient = {
      amount: String(value.amount ?? "").trim(),
      unit: String(value.unit ?? "").trim(),
      item: String(value.item ?? "").trim(),
    };

    if (
      !ingredient.amount &&
      !ingredient.unit &&
      ingredient.item &&
      isSectionHeader(ingredient)
    ) {
      return { type: "section", label: ingredient.item };
    }

    return ingredient.item || ingredient.amount || ingredient.unit
      ? ingredient
      : null;
  }

  return null;
}

export function normalizeIngredients(raw: unknown[]): RecipeIngredientLine[] {
  return raw
    .map((entry) => normalizeIngredientLine(entry))
    .filter((entry): entry is RecipeIngredientLine => entry !== null);
}

export function getIngredientItems(
  lines: RecipeIngredientLine[]
): StructuredIngredient[] {
  return lines.filter(isStructuredIngredient);
}

export function parseLegacyIngredient(line: string): StructuredIngredient {
  const trimmed = line.trim();
  if (!trimmed) {
    return { amount: "", unit: "", item: "" };
  }

  if (LEGACY_SECTION_PATTERN.test(trimmed)) {
    return { amount: "", unit: "", item: trimmed };
  }

  const metricMatch = trimmed.match(
    /^([\d½¼¾⅓⅔]+(?:\/\d+)?(?:\.\d+)?)\s*(g|kg|ml|l|oz|lb)\b\s*(.+)$/i
  );
  if (metricMatch) {
    return {
      amount: metricMatch[1].trim(),
      unit: metricMatch[2].toLowerCase(),
      item: metricMatch[3].trim(),
    };
  }

  const amountUnitMatch = trimmed.match(
    /^([\d½¼¾⅓⅔]+(?:\/\d+)?(?:\.\d+)?(?:\s*-\s*[\d½¼¾⅓⅔]+(?:\/\d+)?)?)\s+([a-zA-Z]+)\s+(.+)$/
  );
  if (amountUnitMatch) {
    return {
      amount: amountUnitMatch[1].trim(),
      unit: amountUnitMatch[2].toLowerCase(),
      item: amountUnitMatch[3].trim(),
    };
  }

  return { amount: "", unit: "", item: trimmed };
}

export function ingredientsToDisplayStrings(
  lines: RecipeIngredientLine[]
): string[] {
  return getIngredientItems(lines).map(formatIngredient);
}

export function emptyIngredient(): StructuredIngredient {
  return { amount: "", unit: "", item: "" };
}

export function emptyIngredientSection(): IngredientSection {
  return { type: "section", label: "" };
}

/** @deprecated Use emptyIngredientSection */
export const emptySubheader = emptyIngredientSection;
