import { verifyJWT } from "../utils/jwt";
import { getJwtSecret } from "../utils/jwt-secret";
import { validateSession } from "../lib/auth";

/**
 * Authenticates a request. Accepts JWT from Authorization header/Cookies OR D1 Session tokens.
 * Returns the decoded token or session payload if valid, otherwise null.
 */
export async function authenticate(request, env) {
  let token = null;
  const debug = process.env.NODE_ENV !== "production";
  const authHeader = request.headers.get("Authorization");
  const sessionHeader = request.headers.get("x-session-token");
  const rawCookieHeader = request.headers?.get?.("cookie");

  const cookieValues = {
    token: request.cookies?.get?.("token")?.value,
    auth_token: request.cookies?.get?.("auth_token")?.value,
    admin_token: request.cookies?.get?.("admin_token")?.value,
    tharanitex_session: request.cookies?.get?.("tharanitex_session")?.value,
  };

  // 1. Parse Authorization & Session Headers
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (sessionHeader) {
    token = sessionHeader;
  }

  // 2. Parse Cookies
  if (!token) {
    token = cookieValues.auth_token ||
            cookieValues.token ||
            cookieValues.tharanitex_session ||
            cookieValues.admin_token;

    if (!token && rawCookieHeader) {
      const cookies = Object.fromEntries(
        rawCookieHeader.split(";").map((cookie) => {
          const separator = cookie.indexOf("=");
          const name = (separator === -1 ? cookie : cookie.slice(0, separator)).trim();
          const value = separator === -1 ? "" : cookie.slice(separator + 1).trim();
          return [name, decodeURIComponent(value)];
        })
      );
      token = cookies.auth_token || cookies.token || cookies.tharanitex_session || cookies.admin_token;
    }
  }

  if (!token) {
    if (debug) console.info("AUTHENTICATE DEBUG", { authorizationHeaderExists: Boolean(authHeader), tokenCookieExists: Boolean(cookieValues.token), authTokenCookieExists: Boolean(cookieValues.auth_token), sessionCookieExists: Boolean(cookieValues.tharanitex_session), adminTokenCookieExists: Boolean(cookieValues.admin_token), rawCookieHeaderExists: Boolean(rawCookieHeader), jwtVerificationSucceeded: false, failureReason: "No authentication token was sent." });
    return null;
  }

  // 3. Try JWT Verification
  try {
    const secret = getJwtSecret(env);
    const payload = await verifyJWT(token, secret);
    if (payload) {
      if (debug) console.info("AUTHENTICATE DEBUG", { method: "JWT", jwtVerificationSucceeded: true, failureReason: null });
      return {
        ...payload,
        id: String(payload.id),
        userId: String(payload.id),
      };
    }
  } catch (error) {
    // JWT verification failed (might be a raw D1 Session UUID token)
  }

  // 4. Try D1 Session Verification Fallback
  try {
    const sessionUser = await validateSession(token, env);
    if (sessionUser) {
      if (debug) console.info("AUTHENTICATE DEBUG", { method: "D1_SESSION", sessionVerificationSucceeded: true, failureReason: null });
      const resolvedId = String(sessionUser.userId || sessionUser.id);
      return {
        id: resolvedId,
        userId: resolvedId,
        email: sessionUser.email || "",
        role: sessionUser.userType === "admin" || sessionUser.role === "Super Admin" ? "admin" : "customer",
        userType: sessionUser.userType || (sessionUser.role === "admin" ? "admin" : "customer"),
        fullName: sessionUser.fullName || sessionUser.name || "",
        customerId: sessionUser.customerId || null,
        phoneVerified: sessionUser.phoneVerified ?? true,
      };
    }
  } catch (error) {
    // Session validation fallback failed
  }

  if (debug) console.info("AUTHENTICATE DEBUG", { jwtVerificationSucceeded: false, failureReason: "Token and Session verification failed." });
  return null;
}

/**
 * Authenticates a request and guarantees the user has the 'admin' role.
 * Returns decoded payload if true, otherwise null.
 */
export async function authenticateAdmin(request, env) {
  const payload = await authenticate(request, env);
  if (!payload) {
    return null;
  }
  const isAdmin = payload.role === "admin" || payload.userType === "admin" || payload.role === "Super Admin";
  if (!isAdmin) {
    return null;
  }
  return payload;
}
