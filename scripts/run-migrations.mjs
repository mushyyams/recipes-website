import fs from "fs";
import path from "path";
import postgres from "postgres";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function getConnectionString() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const password = process.env.SUPABASE_DB_PASSWORD;
  const projectRef =
    process.env.SUPABASE_PROJECT_REF ??
    process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
      /https:\/\/([^.]+)\.supabase\.co/
    )?.[1];

  if (!password || !projectRef) {
    throw new Error(
      [
        "Missing database credentials.",
        "Add one of these to .env.local:",
        "  DATABASE_URL=postgresql://postgres.[ref]:[password]@...",
        "  SUPABASE_DB_PASSWORD=[your database password]",
        "",
        "Find the password in Supabase → Project Settings → Database.",
      ].join("\n")
    );
  }

  return `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`;
}

async function getColumnType(sql, table, column) {
  const rows = await sql`
    select data_type, udt_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name = ${table}
      and column_name = ${column}
  `;
  return rows[0] ?? null;
}

async function main() {
  loadEnvLocal();
  const connectionString = getConnectionString();
  const sql = postgres(connectionString, { ssl: "require", max: 1 });

  try {
    const ingredientsType = await getColumnType(sql, "recipe_forks", "ingredients");
    const stepsType = await getColumnType(sql, "recipe_forks", "steps");

    console.log("Current column types:");
    console.log(`  ingredients: ${ingredientsType?.udt_name ?? "missing"}`);
    console.log(`  steps: ${stepsType?.udt_name ?? "missing"}`);

    if (ingredientsType?.udt_name !== "jsonb") {
      console.log("\nRunning 003_structured_fork_ingredients.sql …");
      const migration003 = fs.readFileSync(
        path.join(process.cwd(), "supabase/migrations/003_structured_fork_ingredients.sql"),
        "utf8"
      );
      await sql.unsafe(migration003);
      console.log("  ✓ ingredients converted to jsonb");
    } else {
      console.log("\nSkipping 003 — ingredients is already jsonb");
    }

    if (stepsType?.udt_name !== "jsonb") {
      console.log("\nRunning 004_structured_fork_steps.sql …");
      const migration004 = fs.readFileSync(
        path.join(process.cwd(), "supabase/migrations/004_structured_fork_steps.sql"),
        "utf8"
      );
      await sql.unsafe(migration004);
      console.log("  ✓ steps converted to jsonb");
    } else {
      console.log("\nSkipping 004 — steps is already jsonb");
    }

    const verifyIngredients = await getColumnType(sql, "recipe_forks", "ingredients");
    const verifySteps = await getColumnType(sql, "recipe_forks", "steps");
    console.log("\nVerified column types:");
    console.log(`  ingredients: ${verifyIngredients?.udt_name}`);
    console.log(`  steps: ${verifySteps?.udt_name}`);
    console.log("\nMigrations complete.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
