import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { logoutSession, buildClearCookieHeader, buildClearAdminCookieHeader } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/types/auth";

export async function POST(request) {
  try {
    const { env } = await getCloudflareContext({ async: true }).catch(() => ({ env: undefined }));
    const token =
      request.cookies?.get?.("admin_token")?.value ||
      request.cookies?.get?.(SESSION_COOKIE_NAME)?.value ||
      request.cookies?.get?.("tharanitex_session")?.value ||
      request.cookies?.get?.("auth_token")?.value ||
      request.cookies?.get?.("token")?.value ||
      request.headers?.get?.("x-session-token") ||
      "";

    if (token) {
      await logoutSession(token, env).catch(() => {});
    }

    const clearHeader = buildClearCookieHeader();
    const clearAdminHeader = buildClearAdminCookieHeader();
    const isProd = process.env.NODE_ENV === "production";
    const secureFlag = isProd ? "; Secure" : "";
    const expireCookieOptions = `; Path=/; HttpOnly; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`;

    const response = NextResponse.json({
      success: true,
      message: "Admin logged out successfully.",
    });

    response.headers.append("Set-Cookie", clearAdminHeader);
    response.headers.append("Set-Cookie", clearHeader);
    response.headers.append("Set-Cookie", `token=${expireCookieOptions}`);
    response.headers.append("Set-Cookie", `auth_token=${expireCookieOptions}`);
    return response;
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err?.message || "Logout failed.",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
