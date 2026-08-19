import { validateSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/types/auth";
import { CheckoutError } from "@/lib/db/order";

export async function requireAdmin(request, env) {
  const token = request.cookies?.get?.(SESSION_COOKIE_NAME)?.value || request.headers.get("x-session-token") || "";
  const user = await validateSession(token, env);
  if (!user || user.userType !== "admin") throw new CheckoutError("Admin access required.", 403);
  return user;
}

export function errorResponse(error, fallback = "Request failed.") {
  return Response.json({ error: error?.message || fallback }, { status: error?.status || 500 });
}
