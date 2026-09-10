import { ApiResponse } from "@/utils/ApiResponse";
import { authenticateAdmin } from "@/middleware/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

export async function GET(request) {
  let env;
  try {
    const ctx = await getCloudflareContext({ async: true });
    env = ctx?.env;
  } catch {
    // Cloudflare context unavailable in local dev / Node environment
  }

  const admin = await authenticateAdmin(request, env);
  if (!admin) {
    return ApiResponse.unauthorized("Admin access required");
  }

  return ApiResponse.success({
    id: admin.id || admin.userId || 1,
    name: admin.fullName || admin.name || "Super Admin",
    email: admin.email || "admin@tharanitextiles.com",
    role: admin.role || "admin",
    userType: "admin",
  });
}

