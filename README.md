# Slow Flame — Recipe Publication

A publication-style recipe website for TikTok creators. Publish full recipe articles via Decap CMS, and let readers fork recipes like GitHub repos.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Publish recipes (Decap CMS)

Your recipes live as markdown in `content/recipes/`. Use the browser editor at **`/admin`** to create and edit them — changes commit to GitHub and Vercel redeploys.

### One-time setup

**1. Update `public/admin/config.yml`**

```yaml
backend:
  repo: your-github-username/your-repo-name
  branch: main
  base_url: https://your-site.vercel.app   # your production URL
```

**2. Create a GitHub OAuth App**

GitHub → Settings → Developer settings → OAuth Apps → New:

| Field | Value |
|-------|-------|
| Homepage URL | `https://your-site.vercel.app` |
| Callback URL | `https://your-site.vercel.app/api/decap-auth/callback` |

Copy the Client ID and generate a Client Secret.

**3. Add env vars in Vercel** (and `.env.local` for local OAuth testing)

```
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

**4. Local editing with live GitHub saves**

```bash
npm run dev      # terminal 1
npm run cms      # terminal 2 — proxies GitHub API locally
```

Then open [http://localhost:3000/admin](http://localhost:3000/admin).

For local-only editing without GitHub, Decap can use the `test-repo` backend — but production should use `github`.

---

## Recipe forks (Supabase)

Readers can fork a recipe from any article page, tweak it, and publish a variation under their name. Forks appear in a collapsible **Community variations** section on the original recipe — out of the way until someone wants to browse them.

### One-time setup

**1. Create a Supabase project** at [supabase.com](https://supabase.com)

**2. Run the migration**

In Supabase → SQL → New query, paste and run:

`supabase/migrations/001_recipe_forks.sql`

**3. Add env vars**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # optional; anon key works with the included RLS policies
```

### Future: user accounts

The `recipe_forks` table already has a nullable `user_id` column. When you add Supabase Auth, link forks to logged-in users and tighten the insert RLS policy.

---

## Deploy to Vercel

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.example`
4. Deploy

---

## Project structure

```
content/recipes/          Your recipes (edited via /admin)
public/admin/             Decap CMS config
src/app/api/forks/        Fork create/list API
src/app/api/decap-auth/   GitHub OAuth for CMS
src/app/recipes/[slug]/fork/       Fork creation form
src/app/recipes/[slug]/forks/[id]/ Fork detail page
supabase/migrations/      Database schema for forks
```

## Add a recipe manually

Create `content/recipes/my-recipe.md` — see existing files for the frontmatter format. Or use `/admin` after CMS setup.
