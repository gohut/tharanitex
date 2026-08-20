import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

export async function POST(request) {
  try {
    console.log("ADMIN LOGIN 1: entered route");

    const { env } = await getCloudflareContext({ async: true });

    console.log("ADMIN LOGIN 2: got Cloudflare context");
    console.log("ADMIN LOGIN 2a: env exists =", !!env);
    console.log("ADMIN LOGIN 2b: DB exists =", !!env?.DB);
    console.log("ADMIN LOGIN 2c: KV exists =", !!env?.KV);

    let body;

    try {
      body = await request.json();
      console.log("ADMIN LOGIN 3: parsed request body");
    } catch {
      console.log("ADMIN LOGIN ERROR: invalid JSON");

      return Response.json(
        {
          success: false,
          message: "Invalid JSON format in request body.",
          error: "BAD_REQUEST",
        },
        { status: 400 }
      );
    }

    if (!body || !body.email || !body.password) {
      console.log("ADMIN LOGIN ERROR: missing credentials");

      return Response.json(
        {
          success: false,
          message: "Email and password are required.",
          error: "BAD_REQUEST",
        },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get("user-agent");
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip");

    console.log("ADMIN LOGIN 4: calling adminLogin");

    const result = await adminLogin(
      body.email,
      body.password,
      userAgent,
      ipAddress,
      env
    );

    console.log("ADMIN LOGIN 5: adminLogin returned");
    console.log("ADMIN LOGIN 5a: session token exists =", !!result?.sessionToken);
    console.log("ADMIN LOGIN 5b: user exists =", !!result?.user);

    const cookieHeader = buildSessionCookieHeader(result.sessionToken);

    console.log("ADMIN LOGIN 6: session cookie built");

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
      `admin_token=${result.sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
        7 * 24 * 60 * 60
      }`
    );

    console.log("ADMIN LOGIN 7: cookies attached, returning success");

    return response;
  } catch (err) {
    console.error("ADMIN LOGIN FATAL ERROR:", err);
    console.error("ADMIN LOGIN FATAL MESSAGE:", err?.message);
    console.error("ADMIN LOGIN FATAL STACK:", err?.stack);

    return Response.json(
      {
        success: false,
        message: err?.message || "Authentication failed.",
        error: "AUTH_FAILED",
      },
      { status: 500 }
    );
  }
}