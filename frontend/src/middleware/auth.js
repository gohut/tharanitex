import { verifyJWT } from "../utils/jwt";
import { getJwtSecret } from "../utils/jwt-secret";

/**
 * Authenticates a request. Extracts JWT from Authorization header or Cookies.
 * Returns the decoded token payload if valid, otherwise null.
 */
export async function authenticate(request, env) {
  let token = null;
  const debug = process.env.NODE_ENV !== "production";
  const authHeader = request.headers.get("Authorization");
  const rawCookieHeader = request.headers?.get?.("cookie");
  const cookieValues = {
    token: Boolean(request.cookies?.get?.("token")?.value),
    auth_token: Boolean(request.cookies?.get?.("auth_token")?.value),
    admin_token: Boolean(request.cookies?.get?.("admin_token")?.value),
  };

  // 1. Parse Authorization Header
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // 2. Parse Cookies
  if (!token) {
    token = request.cookies?.get?.("auth_token")?.value ||
            request.cookies?.get?.("token")?.value ||
            request.cookies?.get?.("admin_token")?.value;

    if (!token) {
      if (rawCookieHeader) {
        const cookies = Object.fromEntries(
          rawCookieHeader.split(";").map((cookie) => {
            const separator = cookie.indexOf("=");
            const name = (separator === -1 ? cookie : cookie.slice(0, separator)).trim();
            const value = separator === -1 ? "" : cookie.slice(separator + 1).trim();
            return [name, decodeURIComponent(value)];
          })
        );
        token = cookies.auth_token || cookies.token || cookies.admin_token;
      }
    }
  }

  if (!token) {
    if (debug) console.info("AUTHENTICATE DEBUG", { authorizationHeaderExists: Boolean(authHeader), tokenCookieExists: cookieValues.token, authTokenCookieExists: cookieValues.auth_token, adminTokenCookieExists: cookieValues.admin_token, rawCookieHeaderExists: Boolean(rawCookieHeader), jwtVerificationSucceeded: false, jwtVerificationFailed: false, failureReason: "No authentication token was sent." });
    return null;
  }

  try {
    const secret = getJwtSecret(env);
    const payload = await verifyJWT(token, secret);
    if (debug) console.info("AUTHENTICATE DEBUG", { authorizationHeaderExists: Boolean(authHeader), tokenCookieExists: cookieValues.token, authTokenCookieExists: cookieValues.auth_token, adminTokenCookieExists: cookieValues.admin_token, rawCookieHeaderExists: Boolean(rawCookieHeader), jwtVerificationSucceeded: Boolean(payload), jwtVerificationFailed: !payload, failureReason: payload ? null : "JWT signature, format, or expiry validation failed." });
    return payload;
  } catch (error) {
    if (debug) console.info("AUTHENTICATE DEBUG", { authorizationHeaderExists: Boolean(authHeader), tokenCookieExists: cookieValues.token, authTokenCookieExists: cookieValues.auth_token, adminTokenCookieExists: cookieValues.admin_token, rawCookieHeaderExists: Boolean(rawCookieHeader), jwtVerificationSucceeded: false, jwtVerificationFailed: true, failureReason: error?.message || "JWT verification failed." });
    return null;
  }
}

/**
 * Authenticates a request and guarantees the user has the 'admin' role.
 * Returns decoded payload if true, otherwise null.
 */
export async function authenticateAdmin(request, env) {
  const payload = await authenticate(request, env);
  if (!payload || payload.role !== "admin") {
    return null;
  }
  return payload;
}
