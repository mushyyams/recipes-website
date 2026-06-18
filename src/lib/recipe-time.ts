export type RecipeTimeParts = {
  hours: string;
  minutes: string;
};

export function emptyRecipeTimeParts(): RecipeTimeParts {
  return { hours: "", minutes: "" };
}

export function parseRecipeTime(value: string): RecipeTimeParts {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return emptyRecipeTimeParts();

  const hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/);
  const minMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)\b/);

  const hours = hourMatch ? Number.parseFloat(hourMatch[1]) : 0;
  const minutes = minMatch ? Number.parseFloat(minMatch[1]) : 0;

  if (!hourMatch && !minMatch) {
    const onlyNumber = normalized.match(/^(\d+(?:\.\d+)?)$/);
    if (onlyNumber) {
      return { hours: "", minutes: onlyNumber[1] };
    }
    return emptyRecipeTimeParts();
  }

  return {
    hours: hours > 0 ? String(hours) : "",
    minutes: minutes > 0 ? String(minutes) : "",
  };
}

export function formatRecipeTime(parts: RecipeTimeParts): string {
  const hours = Number.parseFloat(parts.hours);
  const minutes = Number.parseFloat(parts.minutes);
  const hasHours = parts.hours.trim() && !Number.isNaN(hours) && hours > 0;
  const hasMinutes = parts.minutes.trim() && !Number.isNaN(minutes) && minutes > 0;

  if (hasHours && hasMinutes) {
    return `${trimAmount(hours)} hr ${trimAmount(minutes)} min`;
  }
  if (hasHours) {
    return `${trimAmount(hours)} hr`;
  }
  if (hasMinutes) {
    return `${trimAmount(minutes)} min`;
  }
  return "";
}

function trimAmount(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value);
}

export function normalizeRecipeTimeField(raw: unknown): string {
  if (typeof raw === "string") return raw.trim();
  if (typeof raw === "object" && raw !== null) {
    const value = raw as Record<string, unknown>;
    return formatRecipeTime({
      hours: String(value.hours ?? value.amount ?? "").trim(),
      minutes: String(value.minutes ?? value.extraMinutes ?? "").trim(),
    });
  }
  return "";
}
