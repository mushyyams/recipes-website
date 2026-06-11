import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const GITHUB_TOKEN = "https://github.com/login/oauth/access_token";

function authResponseHtml(status: "success" | "error", content: Record<string, unknown>) {
  const payload = JSON.stringify(content);
  return `<!DOCTYPE html><html><body><script>
(function () {
  const msg = "authorization:github:${status}:" + ${JSON.stringify(payload)};

  function sendToken(origin) {
    if (!window.opener) return;
    window.opener.postMessage(msg, origin || "*");
    window.close();
  }

  window.addEventListener("message", function (e) {
    if (e.data === "authorizing:github") {
      sendToken(e.origin);
    }
  }, false);

  if (window.opener) {
    window.opener.postMessage("authorizing:github", "*");
  }
})();
</script></body></html>`;
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new NextResponse(
      authResponseHtml("error", {
        message: "GitHub OAuth is not configured on the server.",
      }),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieStore = await cookies();
  const savedState = cookieStore.get("decap_oauth_state")?.value;

  cookieStore.delete("decap_oauth_state");

  if (!code || !state || !savedState || state !== savedState) {
    return new NextResponse(
      authResponseHtml("error", { message: "OAuth state mismatch." }),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const tokenResponse = await fetch(GITHUB_TOKEN, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${origin}/api/decap-auth/callback`,
    }),
  });

  const tokenData = (await tokenResponse.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenResponse.ok || !tokenData.access_token) {
    return new NextResponse(
      authResponseHtml("error", {
        message:
          tokenData.error_description ?? "Could not complete GitHub login.",
      }),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  return new NextResponse(
    authResponseHtml("success", {
      token: tokenData.access_token,
      provider: "github",
    }),
    { headers: { "Content-Type": "text/html" } }
  );
}
