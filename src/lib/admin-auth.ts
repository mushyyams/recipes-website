import { createClient } from "@supabase/supabase-js";

export function verifyAdminSecret(request: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;

  const header = request.headers.get("x-admin-secretet");
  return header === secret;
}

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function adminNotConfiguredResponse() {
  return new Response(
    JSON.stringify({
      error:
        "Admin is not configured. Set ADMIN_SECRET and SUPABASE_SERVICE_ROLE_KEY.",
    }),
    { status: 503, headers: { "Content-Type": "application/json" } }
  );
}

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: "Unauthorized." }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
