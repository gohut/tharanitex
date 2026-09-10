import { verifyJWT } from "../utils/jwt";
import { getJwtSecret } from "../utils/jwt-secret";
import { validateSession } from "../lib/auth";

/**
 * Check whether a string looks like a JWT (header.payload.signature)
 */
function isJwt(token) {
  return typeof token === "string" && token.split(".").length === 3;
}

/**
 * Helper to resolve Cloudflare runtime env safely
 */
async function resolveEnv(env) {
  if (env && (env.JWT_SECRET || env.DB || env.KV || env.ADMIN_EMAIL)) {
    return env;
  }

  if (typeof globalThis !== "undefined" && globalThis.__CF_ENV__) {
    return globalThis.__CF_ENV__;
  }

  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    if (ctx && ctx.env) {
      if (typeof globalThis !== "undefined") {
        globalThis.__CF_ENV__ = ctx.env;
      }
      return ctx.env;
    }
  } catch {
    // Cloudflare context unavailable in local or static context
  }

  return env || (typeof process !== "undefined" ? process.env : {});
}

/**
 * Read a cookie safely from Next.js request cookies or raw cookie header.
 */
function getCookie(request, name) {
  try {
    const value = request.cookies?.get?.(name)?.value;
    if (value) {
      return value;
    }
  } catch {
    // Continue to raw cookie parsing.
  }

  const raw = request.headers?.get?.("cookie");
  if (!raw) {
    return null;
  }

  for (const part of raw.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = part.slice(0, separator).trim();
    if (key !== name) {
      continue;
    }

    const value = part.slice(separator + 1).trim();
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  return null;
}

/** 
 * Get the general customer authentication token.
 *
 * Priority:
 * 1. Authorization: Bearer <token>
 * 2. auth_token (Primary customer cookie)
 * 3. tharanitex_session (D1 session cookie)
 * 4. token (Customer cookie alias)
 * 5. x-session-token (Header)
 * 6. admin_token (Admin accessing customer endpoints)
 */
function getGeneralToken(request) {
  const authHeader = request.headers?.get?.("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  return (
    getCookie(request, "auth_token") ||
    getCookie(request, "tharanitex_session") ||
    getCookie(request, "token") ||
    request.headers?.get?.("x-session-token") ||
    getCookie(request, "admin_token") ||
    null
  );
}

/**
 * Get the ADMIN authentication token.
 *
 * Priority:
 * 1. admin_token (Dedicated admin cookie)
 * 2. tharanitex_session (Admin D1 session cookie)
 * 3. x-session-token (Explicit session header)
 * 4. Authorization: Bearer <token>
 */
function getAdminToken(request) {
  return (
    getCookie(request, "admin_token") ||
    getCookie(request, "tharanitex_session") ||
    request.headers?.get?.("x-session-token") ||
    (request.headers?.get?.("Authorization")?.startsWith("Bearer ")
      ? request.headers.get("Authorization").substring(7).trim()
      : null) ||
    null
  );
}

/**
 * Canonical customer authentication resolver.
 * Resolves D1 session tokens and JWTs into a unified customer identity.
 */
export async function authenticate(request, env) {
  const token = getGeneralToken(request);
  if (!token) {
    return null;
  }

  const resolvedEnv = await resolveEnv(env);

  /*
   * 1. If token is an opaque D1 session identifier
   */
  try {
    const sessionUser = await validateSession(token, resolvedEnv);
    if (sessionUser && (sessionUser.id || sessionUser.userId)) {
      const userId = String(sessionUser.id || sessionUser.userId);
      return {
        ...sessionUser,
        id: userId,
        userId: userId,
        email: sessionUser.email || "",
        role: sessionUser.role || (sessionUser.userType === "admin" ? "admin" : "customer"),
        userType: sessionUser.userType || "customer",
        name: sessionUser.name || sessionUser.fullName || "Customer",
        fullName: sessionUser.fullName || sessionUser.name || "Customer",
      };
    }
  } catch {
    // D1 session validation fallback
  }

  /*
   * 2. If token is formatted as JWT (header.payload.signature)
   */
  if (isJwt(token)) {
    try {
      const secret = getJwtSecret(resolvedEnv);
      const payload = await verifyJWT(token, secret);

      if (payload && payload.id) {
        return {
          ...payload,
          id: String(payload.id),
          userId: String(payload.id),
          email: payload.email || "",
          role: payload.role || "customer",
          userType: (payload.role === "admin" || payload.userType === "admin") ? "admin" : "customer",
          name: payload.name || payload.fullName || "Customer",
          fullName: payload.fullName || payload.name || "Customer",
        };
      }
    } catch {
      // JWT signature verification fallback
    }
  }

  return null;
}

/**
 * Canonical ADMIN authentication & authorization resolver.
 * Strictly enforces that the authenticated identity is an active administrator.
 * Normal customer tokens are strictly rejected.
 */
export async function authenticateAdmin(request, env) {
  const adminToken = getAdminToken(request);
  if (!adminToken) {
    return null;
  }

  const resolvedEnv = await resolveEnv(env);

  /*
   * 1. Validate D1 session first (primary for staff/admin logins)
   */
  try {
    const sessionUser = await validateSession(adminToken, resolvedEnv);

    if (sessionUser) {
      const isAdmin =
        sessionUser.userType === "admin" ||
        sessionUser.role === "Super Admin" ||
        sessionUser.role === "admin" ||
        sessionUser.role === "Manager" ||
        sessionUser.role === "Support Staff";

      if (isAdmin && sessionUser.status !== "Inactive") {
        return {
          ...sessionUser,
          id: String(sessionUser.id || sessionUser.userId),
          userId: String(sessionUser.userId || sessionUser.id),
          email: sessionUser.email || "",
          role: sessionUser.role || "Super Admin",
          roleId: sessionUser.roleId || 1,
          roleName: sessionUser.roleName || sessionUser.role || "Super Admin",
          userType: "admin",
          status: sessionUser.status || "Active",
          name: sessionUser.name || sessionUser.fullName || "Admin",
          fullName: sessionUser.fullName || sessionUser.name || "Admin",
        };
      }

      // If session exists but belongs to a customer, refuse admin access
      return null;
    }
  } catch {
    // Session lookup fallback
  }

  /*
   * 2. Fallback: Validate JWT if token is formatted as JWT
   */
  if (isJwt(adminToken)) {
    try {
      const secret = getJwtSecret(resolvedEnv);
      const payload = await verifyJWT(adminToken, secret);

      if (payload) {
        const isAdmin =
          payload.role === "admin" ||
          payload.userType === "admin" ||
          payload.role === "Super Admin" ||
          payload.role === "Manager";

        if (isAdmin) {
          return {
            ...payload,
            id: String(payload.id),
            userId: String(payload.id),
            email: payload.email || "",
            role: payload.role || "Super Admin",
            roleId: payload.roleId || 1,
            roleName: payload.roleName || payload.role || "Super Admin",
            userType: "admin",
            status: "Active",
            name: payload.name || payload.fullName || "Admin",
            fullName: payload.fullName || payload.name || "Admin",
          };
        }

        return null;
      }
    } catch {
      // JWT verification fallback
    }
  }

  return null;
}