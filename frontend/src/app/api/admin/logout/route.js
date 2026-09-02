import { getCloudflareContext } from "@opennextjs/cloudflare";
import { logoutSession, buildClearCookieHeader, buildClearAdminCookieHeader } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/types/auth";

export const runtime = "edge";

export async function POST(request) {
  try {
    const { env } = await getCloudflareContext({ async: true }).catch(() => ({ env: undefined }));
    const token =
      request.cookies?.get?.(SESSION_COOKIE_NAME)?.value ||
      request.cookies?.get?.("admin_token")?.value ||
      request.cookies?.get?.("tharanitex_session")?.value ||
      "";

    if (token) {
      await logoutSession(token, env).catch(() => {});
    }

    const clearHeader = buildClearCookieHeader();
    const clearAdminHeader = buildClearAdminCookieHeader();
    const response = Response.json({
      success: true,
      message: "Admin logged out successfully.",
    });

    response.headers.append("Set-Cookie", clearHeader);
    response.headers.append("Set-Cookie", clearAdminHeader);
    return response;
  } catch (err) {
    return Response.json(
      {
        success: false,
        message: err?.message || "Logout failed.",
      },
      { status: 500 }
    );
  }
}
