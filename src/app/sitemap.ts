import type { MetadataRoute } from "next";
import { getAllRecipes } from "@/lib/recipes";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const recipes = getAllRecipes();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/recipes"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const recipePages: MetadataRoute.Sitemap = recipes.map((recipe) => ({
    url: absoluteUrl(`/recipes/${recipe.slug}`),
    lastModified: new Date(recipe.publishedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...recipePages];
}
