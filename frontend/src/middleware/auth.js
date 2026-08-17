import { verifyJWT } from "../utils/jwt";

/**
 * Authenticates a request. Extracts JWT from Authorization header or Cookies.
 * Returns the decoded token payload if valid, otherwise null.
 */
export async function authenticate(request) {
  let token = null;

  // 1. Parse Authorization Header
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // 2. Parse Cookies
  if (!token) {
    token = request.cookies?.get?.("auth_token")?.value ||
            request.cookies?.get?.("token")?.value ||
            request.cookies?.get?.("admin_token")?.value;

    if (!token) {
      const cookieHeader = request.headers?.get?.("cookie");
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split(";").map((cookie) => {
            const parts = cookie.split("=");
            return [parts[0].trim(), parts[1] ? decodeURIComponent(parts[1].trim()) : ""];
          })
        );
        token = cookies.auth_token || cookies.token || cookies.admin_token;
      }
    }
  }

  if (!token) {
    return null;
  }

  const secret = process.env.JWT_SECRET || "tharanitex_super_secret_key_123!";
  return await verifyJWT(token, secret);
}

/**
 * Authenticates a request and guarantees the user has the 'admin' role.
 * Returns decoded payload if true, otherwise null.
 */
export async function authenticateAdmin(request) {
  const payload = await authenticate(request);
  if (!payload || payload.role !== "admin") {
    return null;
  }
  return payload;
}
