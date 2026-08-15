import { validateSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/types/auth";
import { CheckoutError } from "@/lib/db/order";

export async function requireCustomer(request, env) {
  const token = request.cookies?.get?.(SESSION_COOKIE_NAME)?.value || request.headers.get("x-session-token") || "";
  const user = await validateSession(token, env);
  if (!user || user.userType !== "customer") throw new CheckoutError("Please log in before placing an order.", 401);
  return String(user.userId);
}
