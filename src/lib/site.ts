const defaultSiteUrl = "https://recipes-website-psi.vercel.app";

export const siteConfig = {
  name: "Community Archive",
  tagline: "Recipes from my kitchen to yours",
  description:
    "A recipe repository for home cooks. Thoughtful dishes, community creation, and food worth exploring.",
  author: "Harrison Chen",
  social: {
    tiktok: "https://tiktok.com/@mushyyams",
    instagram: "https://instagram.com/mushyyams",
  },
};

/** Canonical production URL — set NEXT_PUBLIC_SITE_URL in Vercel when you add a custom domain. */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? defaultSiteUrl;
  return url.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
