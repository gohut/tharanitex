import { getCloudflareContext } from "@opennextjs/cloudflare";
import { logoutSession, buildClearCookieHeader } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/types/auth";

export const runtime = "edge";

export async function POST(request) {
  let env;
  try {
    const ctx = await getCloudflareContext({ async: true });
    env = ctx?.env;
  } catch {
    // Cloudflare context unavailable in local dev / Node environment
  }

  try {
    const token =
      request.cookies?.get?.(SESSION_COOKIE_NAME)?.value ||
      request.cookies?.get?.("admin_token")?.value ||
      request.cookies?.get?.("auth_token")?.value ||
      request.cookies?.get?.("token")?.value ||
      request.headers?.get?.("x-session-token") ||
      "";

    if (token) {
      try {
        await logoutSession(token, env);
      } catch {
        // Non-blocking logout cleanup
      }
    }
  } catch {
    // Non-blocking error handling
  }

  const isProd = process.env.NODE_ENV === "production";
  const secureFlag = isProd ? "; Secure" : "";
  const expireCookieOptions = `; Path=/; HttpOnly; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`;

  const response = Response.json({
    success: true,
    message: "Admin logged out successfully.",
  });

  response.headers.append("Set-Cookie", buildClearCookieHeader());
  response.headers.append("Set-Cookie", `admin_token=${expireCookieOptions}`);
  response.headers.append("Set-Cookie", `token=${expireCookieOptions}`);
  response.headers.append("Set-Cookie", `auth_token=${expireCookieOptions}`);
  response.headers.append("Set-Cookie", `tharanitex_session=${expireCookieOptions}`);

  return response;
}

