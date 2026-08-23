import { verifyJWT } from "../utils/jwt";
import { getJwtSecret } from "../utils/jwt-secret";
import {
  validateSession,
} from "../lib/auth";

/**
 * Read a cookie safely.
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
 * Get the normal authentication token.
 *
 * Used by customer/general routes.
 *
 * Priority:
 * Authorization header
 * x-session-token
 * auth_token
 * token
 * tharanitex_session
 * admin_token
 */
function getGeneralToken(
  request
) {
  const authHeader =
    request.headers.get(
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
    );
  }

  const sessionHeader =
    request.headers.get(
      "x-session-token"
    );

  if (sessionHeader) {
    return sessionHeader;
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
 * IMPORTANT:
 * Admin sessions are intentionally checked before
 * normal customer authentication cookies.
 *
 * This prevents a stale customer auth_token from
 * overriding an active admin_token.
 */
function getAdminToken(
  request
) {
  /*
   * Admin session cookie has priority.
   */
  const adminToken =
    getCookie(
      request,
      "admin_token"
    );

  if (adminToken) {
    return adminToken;
  }

  /*
   * The admin login also creates the normal
   * TharaniTex session cookie.
   */
  const sessionToken =
    getCookie(
      request,
      "tharanitex_session"
    );

  if (sessionToken) {
    return sessionToken;
  }

  /*
   * Explicit session header fallback.
   */
  const sessionHeader =
    request.headers.get(
      "x-session-token"
    );

  if (sessionHeader) {
    return sessionHeader;
  }

  /*
   * Authorization header fallback.
   */
  const authHeader =
    request.headers.get(
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
    );
  }

  /*
   * Last-resort legacy cookies.
   */
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
 * Normal authentication.
 *
 * Accepts JWT or D1 session tokens.
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
        "AUTHENTICATE DEBUG",
        {
          authenticated: false,
          reason:
            "No authentication token was supplied.",
        }
      );
    }

    return null;
  }

  /*
   * 1. Try JWT.
   */
  try {
    const secret =
      getJwtSecret(env);

    const payload =
      await verifyJWT(
        token,
        secret
      );

    if (payload) {
      if (debug) {
        console.info(
          "AUTHENTICATE DEBUG",
          {
            method: "JWT",
            success: true,
            role:
              payload.role ||
              null,
          }
        );
      }

      return {
        ...payload,
        id: String(
          payload.id
        ),
        userId: String(
          payload.id
        ),
      };
    }
  } catch {
    /*
     * JWT verification failed.
     * Continue with D1 session.
     */
  }

  /*
   * 2. Try D1 session.
   */
  try {
    const sessionUser =
      await validateSession(
        token,
        env
      );

    if (sessionUser) {
      if (debug) {
        console.info(
          "AUTHENTICATE DEBUG",
          {
            method:
              "D1_SESSION",
            success: true,
            userType:
              sessionUser.userType ||
              null,
            role:
              sessionUser.role ||
              null,
          }
        );
      }

      const resolvedId =
        String(
          sessionUser.userId ||
            sessionUser.id
        );

      return {
        ...sessionUser,

        id: resolvedId,

        userId:
          resolvedId,

        email:
          sessionUser.email ||
          "",

        role:
          sessionUser.userType ===
            "admin"
            ? "admin"
            : sessionUser.role ===
                "Super Admin"
              ? "admin"
              : sessionUser.role ||
                "customer",

        userType:
          sessionUser.userType ||
          "customer",

        fullName:
          sessionUser.fullName ||
          sessionUser.name ||
          "",

        customerId:
          sessionUser.customerId ||
          null,

        phoneVerified:
          sessionUser.phoneVerified ??
          true,
      };
    }
  } catch (error) {
    if (debug) {
      console.error(
        "AUTHENTICATE SESSION ERROR:",
        error
      );
    }
  }

  if (debug) {
    console.info(
      "AUTHENTICATE DEBUG",
      {
        authenticated: false,
        reason:
          "JWT and D1 session validation failed.",
      }
    );
  }

  return null;
}

/**
 * ADMIN authentication.
 *
 * IMPORTANT:
 * This function does NOT call authenticate()
 * first because authenticate() intentionally supports
 * customer authentication too.
 *
 * Admin routes must specifically prefer the
 * admin_token / admin session.
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
        "AUTHENTICATE ADMIN DEBUG",
        {
          success: false,
          reason:
            "No admin session token supplied.",
        }
      );
    }

    return null;
  }

  /*
   * First validate as a D1 session.
   *
   * This is the important path for your current
   * admin login implementation.
   */
  try {
    const sessionUser =
      await validateSession(
        adminToken,
        env
      );

    if (sessionUser) {
      const isAdmin =
        sessionUser.userType ===
          "admin" ||
        sessionUser.role ===
          "Super Admin" ||
        sessionUser.role ===
          "admin";

      if (isAdmin) {
        if (debug) {
          console.info(
            "AUTHENTICATE ADMIN DEBUG",
            {
              method:
                "D1_SESSION",
              success: true,
              userId:
                sessionUser.userId ||
                sessionUser.id,
              userType:
                sessionUser.userType,
              role:
                sessionUser.role,
            }
          );
        }

        return {
          ...sessionUser,

          id: String(
            sessionUser.id ||
              sessionUser.userId
          ),

          userId: String(
            sessionUser.userId ||
              sessionUser.id
          ),

          role: "admin",

          userType: "admin",
        };
      }

      /*
       * Token is valid but belongs to a customer.
       * DO NOT fall through to a different cookie.
       */
      if (debug) {
        console.info(
          "AUTHENTICATE ADMIN DEBUG",
          {
            success: false,
            reason:
              "Supplied session belongs to a non-admin user.",
            userType:
              sessionUser.userType,
            role:
              sessionUser.role,
          }
        );
      }

      return null;
    }
  } catch (error) {
    if (debug) {
      console.error(
        "AUTHENTICATE ADMIN SESSION ERROR:",
        error
      );
    }
  }

  /*
   * Legacy JWT fallback.
   */
  try {
    const secret =
      getJwtSecret(env);

    const payload =
      await verifyJWT(
        adminToken,
        secret
      );

    if (payload) {
      const isAdmin =
        payload.role ===
          "admin" ||
        payload.userType ===
          "admin" ||
        payload.role ===
          "Super Admin";

      if (isAdmin) {
        if (debug) {
          console.info(
            "AUTHENTICATE ADMIN DEBUG",
            {
              method: "JWT",
              success: true,
              userId:
                payload.id,
            }
          );
        }

        return {
          ...payload,

          id: String(
            payload.id
          ),

          userId: String(
            payload.id
          ),

          role: "admin",

          userType: "admin",
        };
      }
    }
  } catch (error) {
    if (debug) {
      console.error(
        "AUTHENTICATE ADMIN JWT ERROR:",
        error
      );
    }
  }

  if (debug) {
    console.info(
      "AUTHENTICATE ADMIN DEBUG",
      {
        success: false,
        reason:
          "Admin token could not be authenticated.",
      }
    );
  }

  return null;
}