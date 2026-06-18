import fs from "fs";
import path from "path";
import type { StructuredIngredient } from "@/lib/ingredients";
import { getIngredientItems, type RecipeIngredientLine } from "@/lib/ingredients";
import { OTHER_UNIT_VALUE } from "@/lib/ingredients";

const UNITS_FILE = path.join(process.cwd(), "content/settings/recipe-units.json");
const DECAP_CONFIG = path.join(process.cwd(), "public/admin/config.yml");

export { OTHER_UNIT_VALUE };

export type RecipeUnitsConfig = {
  fixedUnits: string[];
  customUnitUsage: Record<string, number>;
};

function defaultConfig(): RecipeUnitsConfig {
  return { fixedUnits: [], customUnitUsage: {} };
}

export function readRecipeUnitsConfig(): RecipeUnitsConfig {
  if (!fs.existsSync(UNITS_FILE)) {
    return defaultConfig();
  }

  try {
    const raw = JSON.parse(fs.readFileSync(UNITS_FILE, "utf-8")) as RecipeUnitsConfig;
    return {
      fixedUnits: [...new Set((raw.fixedUnits ?? []).map(normalizeUnitLabel))],
      customUnitUsage: Object.fromEntries(
        Object.entries(raw.customUnitUsage ?? {}).map(([unit, count]) => [
          normalizeUnitLabel(unit),
          Number(count) || 0,
        ])
      ),
    };
  } catch {
    return defaultConfig();
  }
}

function writeRecipeUnitsConfig(config: RecipeUnitsConfig) {
  const dir = path.dirname(UNITS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(
    UNITS_FILE,
    `${JSON.stringify(
      {
        fixedUnits: config.fixedUnits,
        customUnitUsage: config.customUnitUsage,
      },
      null,
      2
    )}\n`,
    "utf-8"
  );
}

export function updateCustomUnitUsage(
  customUnitUsage: Record<string, number>
): RecipeUnitsConfig {
  const config = readRecipeUnitsConfig();
  config.customUnitUsage = customUnitUsage;
  writeRecipeUnitsConfig(config);
  return config;
}

export function normalizeUnitLabel(unit: string): string {
  return unit.trim().toLowerCase();
}

export function getAllFixedUnits(): string[] {
  return readRecipeUnitsConfig().fixedUnits;
}

export function getUnitOptions(): {
  fixedUnits: string[];
  customUnitUsage: Record<string, number>;
} {
  const config = readRecipeUnitsConfig();
  return {
    fixedUnits: config.fixedUnits,
    customUnitUsage: config.customUnitUsage,
  };
}

export function countCustomUnitsFromIngredients(
  lines: RecipeIngredientLine[],
  fixedUnits: string[],
  usage: Record<string, number>
) {
  countCustomUnitsFromIngredientItems(
    getIngredientItems(lines),
    fixedUnits,
    usage
  );
}

function countCustomUnitsFromIngredientItems(
  ingredients: StructuredIngredient[],
  fixedUnits: string[],
  usage: Record<string, number>
) {
  const fixed = new Set(fixedUnits.map(normalizeUnitLabel));

  for (const ingredient of ingredients) {
    const unit = normalizeUnitLabel(ingredient.unit);
    if (!unit || fixed.has(unit)) continue;
    usage[unit] = (usage[unit] ?? 0) + 1;
  }
}

export function promoteCustomUnit(unit: string): RecipeUnitsConfig {
  const normalized = normalizeUnitLabel(unit);
  if (!normalized) {
    throw new Error("Unit is required.");
  }

  const config = readRecipeUnitsConfig();
  if (!config.fixedUnits.includes(normalized)) {
    config.fixedUnits = [...config.fixedUnits, normalized].sort();
  }
  delete config.customUnitUsage[normalized];

  writeRecipeUnitsConfig(config);
  syncDecapUnitOptions(config.fixedUnits);
  return config;
}

export function removeFixedUnit(unit: string): RecipeUnitsConfig {
  const normalized = normalizeUnitLabel(unit);
  const config = readRecipeUnitsConfig();
  config.fixedUnits = config.fixedUnits.filter((entry) => entry !== normalized);

  writeRecipeUnitsConfig(config);
  syncDecapUnitOptions(config.fixedUnits);
  return config;
}

export function dismissCustomUnit(unit: string): RecipeUnitsConfig {
  const normalized = normalizeUnitLabel(unit);
  const config = readRecipeUnitsConfig();
  delete config.customUnitUsage[normalized];

  writeRecipeUnitsConfig(config);
  return config;
}

export function syncDecapUnitOptions(fixedUnits: string[]) {
  if (!fs.existsSync(DECAP_CONFIG)) return;

  const optionsBlock = [
    '            - { label: "(none)", value: "" }',
    ...fixedUnits.map(
      (unit) => `            - { label: "${unit}", value: "${unit}" }`
    ),
    `            - { label: "Other…", value: "${OTHER_UNIT_VALUE}" }`,
  ].join("\n");

  const config = fs.readFileSync(DECAP_CONFIG, "utf-8");
  const markerStart = "# UNIT_OPTIONS_START";
  const markerEnd = "# UNIT_OPTIONS_END";
  const pattern = new RegExp(
    `${markerStart}[\\s\\S]*?${markerEnd}`,
    "m"
  );

  if (!pattern.test(config)) return;

  const next = config.replace(
    pattern,
    `${markerStart}\n${optionsBlock}\n          ${markerEnd}`
  );
  fs.writeFileSync(DECAP_CONFIG, next, "utf-8");
}

export function resolveIngredientUnit(
  unit: string,
  otherUnit: string,
  fixedUnits: string[]
): string {
  const normalized = normalizeUnitLabel(unit);
  if (!normalized || normalized === OTHER_UNIT_VALUE) {
    return normalizeUnitLabel(otherUnit);
  }
  if (fixedUnits.includes(normalized)) {
    return normalized;
  }
  return normalized;
}
