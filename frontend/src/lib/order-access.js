import { authenticateAdmin } from "@/middleware/auth";
import { CheckoutError } from "@/lib/db/order";

export async function requireAdmin(request, env) {
  const user = await authenticateAdmin(request, env);
  if (!user || user.userType !== "admin") {
    throw new CheckoutError("Admin access required.", 403);
  }
  return user;
}

export function errorResponse(error, fallback = "Request failed.") {
  return Response.json({ error: error?.message || fallback }, { status: error?.status || 500 });
}

