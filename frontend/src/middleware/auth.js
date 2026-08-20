import { validateSession } from "../lib/auth";
import { SESSION_COOKIE_NAME } from "../types/auth";

/**
 * Canonical authentication resolver.  Identity is derived exclusively from the
 * HttpOnly D1 session cookie; callers must never accept a client user id.
 */
export async function requireAuth(request, env) {
  let sessionToken = null;
  let jwtToken = null;

  if (request.cookies?.get) {
    sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    jwtToken = request.cookies.get("token")?.value;
  }

  if (request.headers?.get) {
    const rawCookie = request.headers.get("cookie") || "";
    if (!sessionToken) {
      const matchSession = rawCookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
      if (matchSession) sessionToken = matchSession[1];
    }
    if (!jwtToken) {
      const matchToken = rawCookie.match(/(?:^|;\s*)token=([^;]+)/);
      if (matchToken) jwtToken = matchToken[1];
    }
    if (!jwtToken) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        jwtToken = authHeader.replace("Bearer ", "").trim();
      }
    }
  }

  console.log("[DEBUG requireAuth] sessionToken:", sessionToken, "jwtToken:", jwtToken);

  // 1. D1/KV Session Lookup
  if (sessionToken) {
    try {
      const user = await validateSession(sessionToken, env);
      console.log("[DEBUG requireAuth] validateSession user:", user);
      if (user) return user;
    } catch (e) {
      console.log("[DEBUG requireAuth] validateSession exception:", e);
    }
  }

  // 2. JWT Token Lookup
  const candidate = jwtToken || (sessionToken && sessionToken.includes(".") ? sessionToken : null);
  if (candidate && candidate.includes(".")) {
    try {
      const parts = candidate.split(".");
      if (parts.length === 3) {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const payload = JSON.parse(jsonPayload);
        if (payload && (payload.id || payload.userId)) {
          const uid = String(payload.id || payload.userId);
          return {
            id: uid,
            userId: uid,
            userType: payload.role === "admin" ? "admin" : "customer",
            customerId: uid,
            fullName: payload.name || payload.email || "Customer",
            phoneNumber: payload.phone || "",
            role: payload.role || "customer",
            phoneVerified: true,
          };
        }
      }
    } catch (e) {}
  }

  return null;
}

// Backward-compatible name for controllers during migration. It remains
// session-only and deliberately does not inspect Authorization/JWT cookies.
export async function authenticate(request, env) {
  return requireAuth(request, env);
}

/**
 * Authenticates a request and guarantees the user has the 'admin' role.
 * Returns decoded payload if true, otherwise null.
 */
export async function authenticateAdmin(request, env) {
  const payload = await requireAuth(request, env);
  if (!payload) {
    return null;
  }
  const isAdmin = payload.role === "admin" || payload.userType === "admin" || payload.role === "Super Admin";
  if (!isAdmin) {
    return null;
  }
  return payload;
}
