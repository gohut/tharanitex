import { requireAuth } from "@/middleware/auth";
import { checkPermission, getDB } from "@/lib/auth";
import { CheckoutError } from "@/lib/db/order";

export async function requireAdmin(request, env) {
  // Temporary development-only bypass controlled by LOCAL_ADMIN_BYPASS=true
  const isDevBypass =
    process.env.NODE_ENV !== "production" &&
    (process.env.LOCAL_ADMIN_BYPASS === "true" ||
      process.env.NEXT_PUBLIC_LOCAL_ADMIN_BYPASS === "true" ||
      env?.LOCAL_ADMIN_BYPASS === "true");

  if (isDevBypass) {
    return {
      id: 1,
      userId: 1,
      userType: "admin",
      name: "Super Admin",
      email: "admin@tharanitextiles.com",
      role: "Super Admin",
    };
  }

  const user = await requireAuth(request, env);
  if (!user || user.userType !== "admin") throw new CheckoutError("Admin access required.", 403);
  return user;
}

export async function requirePermission(request, env, moduleName, action) {
  const admin = await requireAdmin(request, env);
  const db = await getDB(env);
  if (!(await checkPermission(db, admin.roleId, moduleName, action))) {
    throw new CheckoutError("You do not have permission for this action.", 403);
  }
  return admin;
}

export function errorResponse(error, fallback = "Request failed.") {
  return Response.json({ error: error?.message || fallback }, { status: error?.status || 500 });
}
