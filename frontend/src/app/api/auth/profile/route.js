import { AuthController } from "@/controllers/AuthController";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request) {
  try {
    const { env } = await getCloudflareContext({
      async: true,
    }).catch(() => ({ env: undefined }));

    const response = await AuthController.getProfile(request, env);

    response.headers.set(
      "Cache-Control",
      "private, no-store, no-cache, must-revalidate"
    );

    response.headers.set("CDN-Cache-Control", "no-store");
    response.headers.set("Vary", "Cookie, Authorization");

    return response;
  } catch (err) {
    console.error("GET /api/auth/profile error:", err);
    return Response.json(
      { success: false, message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { env } = await getCloudflareContext({
      async: true,
    }).catch(() => ({ env: undefined }));

    const response = await AuthController.updateProfile(request, env);

    response.headers.set(
      "Cache-Control",
      "private, no-store, no-cache, must-revalidate"
    );

    response.headers.set("CDN-Cache-Control", "no-store");
    response.headers.set("Vary", "Cookie, Authorization");

    return response;
  } catch (err) {
    console.error("PUT /api/auth/profile error:", err);
    return Response.json(
      { success: false, message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}