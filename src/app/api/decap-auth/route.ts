import { NextResponse } from "next/server";

const GITHUB_AUTHORIZE = "https://github.com/login/oauth/authorize";

export async function GET(request: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "GITHUB_CLIENT_ID is not configured." },
      { status: 500 }
    );
  }

  const { searchParams, origin } = new URL(request.url);
  const provider = searchParams.get("provider");

  if (provider !== "github") {
    return NextResponse.json({ error: "Unsupported provider." }, { status: 400 });
  }

  const scope = searchParams.get("scope") ?? "repo";
  const state = crypto.randomUUID();

  const redirectUri = `${origin}/api/decap-auth/callback`;
  const authUrl = new URL(GITHUB_AUTHORIZE);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set("decap_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
