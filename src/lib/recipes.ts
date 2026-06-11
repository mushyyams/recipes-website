import fs from "fs";
import path from "path";
import matter from "gray-matter";

const RECIPES_DIR = path.join(process.cwd(), "content/recipes");

export type RecipeMeta = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: "Easy" | "Medium" | "Advanced";
  featured: boolean;
  publishedAt: string;
  image: string;
  imageAlt: string;
  ingredients: string[];
  steps: string[];
};

export type Recipe = RecipeMeta & {
  content: string;
};

function parseRecipeFile(filename: string): Recipe {
  const slug = filename.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(RECIPES_DIR, filename), "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title,
    excerpt: data.excerpt,
    category: data.category,
    tags: data.tags ?? [],
    prepTime: data.prepTime,
    cookTime: data.cookTime,
    servings: data.servings,
    difficulty: data.difficulty,
    featured: data.featured ?? false,
    publishedAt: data.publishedAt,
    image: data.image,
    imageAlt: data.imageAlt,
    ingredients: data.ingredients ?? [],
    steps: data.steps ?? [],
    content,
  };
}

export function getAllRecipes(): Recipe[] {
  const files = fs.readdirSync(RECIPES_DIR).filter((f) => f.endsWith(".md"));
  return files
    .map(parseRecipeFile)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export function getRecipeBySlug(slug: string): Recipe | undefined {
  const filePath = path.join(RECIPES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return undefined;
  return parseRecipeFile(`${slug}.md`);
}

export function getFeaturedRecipes(): Recipe[] {
  return getAllRecipes().filter((r) => r.featured);
}

export function getRecipesByCategory(category: string): Recipe[] {
  return getAllRecipes().filter(
    (r) => r.category.toLowerCase() === category.toLowerCase()
  );
}

export function getAllCategories(): string[] {
  const categories = getAllRecipes().map((r) => r.category);
  return [...new Set(categories)];
}
