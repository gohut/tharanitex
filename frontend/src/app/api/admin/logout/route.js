import { getCloudflareContext } from "@opennextjs/cloudflare";
import { logoutSession, buildClearCookieHeader } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/types/auth";

export const runtime = "edge";

export async function POST(request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const token =
      request.cookies?.get?.(SESSION_COOKIE_NAME)?.value ||
      request.cookies?.get?.("admin_token")?.value ||
      "";

    if (token) {
      await logoutSession(token, env).catch(() => {});
    }

    const clearHeader = buildClearCookieHeader();
    const response = Response.json({
      success: true,
      message: "Admin logged out successfully.",
    });

    response.headers.append("Set-Cookie", clearHeader);
    response.headers.append(
      "Set-Cookie",
      `admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
    );
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
