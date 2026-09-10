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
      request.headers?.get?.("x-session-token") ||
      "";

    if (token) {
      await logoutSession(token, env).catch(() => {});
    }

    const clearHeader = buildClearCookieHeader();
    const clearAdminHeader = buildClearAdminCookieHeader();
    const response = NextResponse.json({
      success: true,
      message: "Admin logged out successfully.",
    });

    response.headers.append("Set-Cookie", clearAdminHeader);
    response.headers.append("Set-Cookie", clearHeader);
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
