import { getCloudflareContext } from "@opennextjs/cloudflare";
import { adminLogin, buildSessionCookieHeader } from "@/lib/auth";

export const runtime = "edge";

export async function POST(request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { success: false, message: "Invalid JSON format in request body.", error: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    if (!body || !body.email || !body.password) {
      return Response.json(
        { success: false, message: "Email and password are required.", error: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get("user-agent");
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("cf-connecting-ip");

    const result = await adminLogin(body.email, body.password, userAgent, ipAddress, env);

    const cookieHeader = buildSessionCookieHeader(result.sessionToken);

    const response = Response.json({
      success: true,
      message: "Admin login successful.",
      data: {
        user: result.user,
        expiresAt: result.expiresAt,
      },
    });

    response.headers.append("Set-Cookie", cookieHeader);
    response.headers.append(
      "Set-Cookie",
      `admin_token=${result.sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    );
    return response;
  } catch (err) {
    return Response.json(
      {
        success: false,
        message: err.message || "Authentication failed.",
        error: "AUTH_FAILED",
      },
      { status: 400 }
    );
  }
}
