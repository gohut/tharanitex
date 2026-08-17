import { authenticate } from "@/middleware/auth";
import { validateSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/types/auth";
import { CheckoutError } from "@/lib/db/order";

export async function requireCustomer(request, env) {
  const customerId = await getCustomerId(request, env);
  if (!customerId) {
    throw new CheckoutError("Please log in before placing an order.", 401);
  }
  return customerId;
}

export async function getCustomerId(request, env) {
  // 1. Try existing JWT authentication (from login / auth_token / token cookies & Bearer header)
  try {
    const payload = await authenticate(request, env);
    if (process.env.NODE_ENV !== "production") console.info("CUSTOMER DEBUG", { jwtPayloadExists: Boolean(payload), payloadIdExists: Boolean(payload?.id), payloadRole: payload?.role || null, customerIdResolved: Boolean(payload && (payload.role === "customer" || !payload.role) && payload.id) });
    if (payload && (payload.role === "customer" || !payload.role) && payload.id) {
      return String(payload.id);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.info("CUSTOMER DEBUG", { jwtPayloadExists: false, payloadIdExists: false, payloadRole: null, customerIdResolved: false, failureReason: error?.message || "JWT lookup failed." });
    // Ignore JWT failure and try session lookup
  }

  // 2. Try D1 Session authentication (from tharanitex_session cookie & x-session-token header)
  try {
    const token = request.cookies?.get?.(SESSION_COOKIE_NAME)?.value || request.headers?.get?.("x-session-token") || "";
    if (token) {
      const user = await validateSession(token, env);
      if (user && user.userType === "customer" && user.userId) {
        return String(user.userId);
      }
    }
  } catch (error) {
    // Ignore session lookup failure
  }

  return null;
}
