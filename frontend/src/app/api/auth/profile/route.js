import { AuthController } from "@/controllers/AuthController";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request) {
  const { env } = await getCloudflareContext({
    async: true,
  });

  const response =
    await AuthController.getProfile(
      request,
      env
    );

  response.headers.set(
    "Cache-Control",
    "private, no-store, no-cache, must-revalidate"
  );

  response.headers.set(
    "CDN-Cache-Control",
    "no-store"
  );

  response.headers.set(
    "Vary",
    "Cookie, Authorization"
  );

  return response;
}

export async function PUT(request) {
  const { env } = await getCloudflareContext({
    async: true,
  });

  const response =
    await AuthController.updateProfile(
      request,
      env
    );

  response.headers.set(
    "Cache-Control",
    "private, no-store, no-cache, must-revalidate"
  );

  response.headers.set(
    "CDN-Cache-Control",
    "no-store"
  );

  response.headers.set(
    "Vary",
    "Cookie, Authorization"
  );

  return response;
}