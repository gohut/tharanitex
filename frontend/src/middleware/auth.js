import { verifyJWT } from "../utils/jwt";
import { getJwtSecret } from "../utils/jwt-secret";
import {
  validateSession,
} from "../lib/auth";

/**
 * Check whether a string looks like a JWT (header.payload.signature)
 */
function isJwt(token) {
  return typeof token === "string" && token.split(".").length === 3;
}

/**
 * Helper to resolve Cloudflare runtime env if not explicitly passed
 */
async function resolveEnv(env) {
  if (env && (env.JWT_SECRET || env.DB || env.KV)) {
    return env;
  }
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    if (ctx && ctx.env) {
      return ctx.env;
    }
  } catch {
    // Cloudflare context unavailable in local or static context
  }
  return env;
}

/**
 * Read a cookie safely from Next.js request cookies or raw cookie header.
 */
function getCookie(
  request,
  name
) {
  try {
    const value =
      request.cookies?.get?.(
        name
      )?.value;

    if (value) {
      return value;
    }
  } catch {
    // Continue to raw cookie parsing.
  }

  const raw =
    request.headers?.get?.(
      "cookie"
    );

  if (!raw) {
    return null;
  }

  for (const part of raw.split(";")) {
    const separator =
      part.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const key =
      part
        .slice(0, separator)
        .trim();

    if (key !== name) {
      continue;
    }

    const value =
      part
        .slice(separator + 1)
        .trim();

    try {
      return decodeURIComponent(
        value
      );
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
 * 3. token (Customer cookie alias)
 * 4. tharanitex_session (D1 session cookie)
 * 5. x-session-token (Header)
 * 6. admin_token (Admin accessing customer endpoints)
 */
function getGeneralToken(
  request
) {
  const authHeader =
    request.headers?.get?.(
      "Authorization"
    );

  if (
    authHeader &&
    authHeader.startsWith(
      "Bearer "
    )
  ) {
    return authHeader.substring(
      7
    ).trim();
  }

  return (
    getCookie(
      request,
      "auth_token"
    ) ||
    getCookie(
      request,
      "token"
    ) ||
    getCookie(
      request,
      "tharanitex_session"
    ) ||
    request.headers?.get?.(
      "x-session-token"
    ) ||
    getCookie(
      request,
      "admin_token"
    ) ||
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
 * 5. auth_token / token
 */
function getAdminToken(
  request
) {
  const adminToken =
    getCookie(
      request,
      "admin_token"
    );

  if (adminToken) {
    return adminToken;
  }

  const sessionToken =
    getCookie(
      request,
      "tharanitex_session"
    );

  if (sessionToken) {
    return sessionToken;
  }

  const sessionHeader =
    request.headers?.get?.(
      "x-session-token"
    );

  if (sessionHeader) {
    return sessionHeader;
  }

  const authHeader =
    request.headers?.get?.(
      "Authorization"
    );

  if (
    authHeader &&
    authHeader.startsWith(
      "Bearer "
    )
  ) {
    return authHeader.substring(
      7
    ).trim();
  }

  return (
    getCookie(
      request,
      "auth_token"
    ) ||
    getCookie(
      request,
      "token"
    ) ||
    null
  );
}

/**
 * Canonical customer authentication resolver.
 *
 * Resolves both JWT and D1 session tokens seamlessly into a unified identity object.
 */
export async function authenticate(
  request,
  env
) {
  const debug =
    process.env.NODE_ENV !==
    "production";

  const token =
    getGeneralToken(
      request
    );

  if (!token) {
    if (debug) {
      console.info(
        "AUTHENTICATE DEBUG: No authentication token supplied."
      );
    }
    return null;
  }

  const resolvedEnv = await resolveEnv(env);

  /*
   * 1. If token is formatted as JWT (3 dot-separated base64 segments)
   */
  if (isJwt(token)) {
    try {
      const secret = getJwtSecret(resolvedEnv);
      const payload = await verifyJWT(token, secret);

      if (payload && payload.id) {
        if (debug) {
          console.info("AUTHENTICATE DEBUG: Successfully verified JWT identity", { id: payload.id, role: payload.role });
        }

        return {
          ...payload,
          id: String(payload.id),
          userId: String(payload.id),
          email: payload.email || "",
          role: payload.role || "customer",
          userType: (payload.role === "admin" || payload.userType === "admin") ? "admin" : "customer",
          name: payload.name || payload.fullName || "",
          fullName: payload.fullName || payload.name || "",
        };
      }
    } catch (err) {
      if (debug) {
        console.warn("AUTHENTICATE DEBUG: JWT signature verification failed:", err?.message);
      }
    }
  }

  /*
   * 2. If token is an opaque D1 session identifier (or fallback for non-JWT tokens)
   */
  try {
    const sessionUser = await validateSession(token, resolvedEnv);
    if (sessionUser && (sessionUser.id || sessionUser.userId)) {
      const userId = String(sessionUser.id || sessionUser.userId);
      if (debug) {
        console.info("AUTHENTICATE DEBUG: Successfully verified D1 session identity", { userId, userType: sessionUser.userType });
      }

      return {
        ...sessionUser,
        id: userId,
        userId: userId,
        email: sessionUser.email || "",
        role: sessionUser.role || (sessionUser.userType === "admin" ? "admin" : "customer"),
        userType: sessionUser.userType || "customer",
        name: sessionUser.name || sessionUser.fullName || "",
        fullName: sessionUser.fullName || sessionUser.name || "",
      };
    }
  } catch (err) {
    if (debug) {
      console.warn("AUTHENTICATE DEBUG: D1 session validation failed:", err?.message);
    }
  }

  return null;
}

/**
 * Canonical ADMIN authentication & authorization resolver.
 *
 * Strictly enforces that the authenticated identity is an active administrator.
 * Normal customer tokens are strictly rejected.
 */
export async function authenticateAdmin(
  request,
  env
) {
  const debug =
    process.env.NODE_ENV !==
    "production";

  const adminToken =
    getAdminToken(
      request
    );

  if (!adminToken) {
    if (debug) {
      console.info(
        "AUTHENTICATE ADMIN DEBUG: No admin session token supplied."
      );
    }
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
        if (debug) {
          console.info("AUTHENTICATE ADMIN DEBUG: D1 session authorized as admin", { userId: sessionUser.id, role: sessionUser.role });
        }

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

      // If session exists but belongs to a normal customer, strictly refuse admin access
      if (debug) {
        console.warn("AUTHENTICATE ADMIN DEBUG: Token belongs to non-admin user; access denied.");
      }
      return null;
    }
  } catch (error) {
    if (debug) {
      console.error("AUTHENTICATE ADMIN DEBUG: Session lookup error:", error);
    }
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
          if (debug) {
            console.info("AUTHENTICATE ADMIN DEBUG: JWT authorized as admin", { id: payload.id, role: payload.role });
          }

          return {
            ...payload,
            id: String(payload.id),
            userId: String(payload.id),
            email: payload.email || "",
            role: payload.role || "admin",
            roleId: payload.roleId || 1,
            roleName: payload.roleName || payload.role || "Super Admin",
            userType: "admin",
            status: "Active",
            name: payload.name || payload.fullName || "Admin",
            fullName: payload.fullName || payload.name || "Admin",
          };
        }

        // JWT is valid but belongs to customer; refuse admin access
        if (debug) {
          console.warn("AUTHENTICATE ADMIN DEBUG: JWT payload is customer; access denied.");
        }
        return null;
      }
    } catch (error) {
      if (debug) {
        console.error("AUTHENTICATE ADMIN DEBUG: JWT verification error:", error);
      }
    }
  }

  return null;
}