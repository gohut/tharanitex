import { AuthService } from "../services/AuthService";
import { Validators } from "../validators/validators";
import { ApiResponse } from "../utils/ApiResponse";
import { authenticate } from "../middleware/auth";
import { logoutSession } from "../lib/auth";

const isProd =
  process.env.NODE_ENV === "production";

const secureFlag = isProd
  ? "; Secure"
  : "";

// Durable 7-day session lifetime (604,800 seconds)
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

const cookieOptions =
  `; Path=/; HttpOnly; Max-Age=${SESSION_MAX_AGE}; SameSite=Lax${secureFlag}`;

const expireCookieOptions =
  `; Path=/; HttpOnly; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`;

export class AuthController {
  static async register(request, env) {
    try {
      const body = await request.json();
      const valErrors = Validators.validateRegister(body);
      if (valErrors) {
        return ApiResponse.badRequest("Validation failed", valErrors);
      }

      const { user, token } = await AuthService.register(body, env);

      const response = ApiResponse.success(user, "User registered successfully", 201);
      response.headers.append(
        "Set-Cookie",
        `token=${token}${cookieOptions}`
      );
      response.headers.append(
        "Set-Cookie",
        `auth_token=${token}${cookieOptions}`
      );
      if (process.env.NODE_ENV !== "production") {
        console.info("AUTH LOGIN DEBUG", { status: 201, setCookie: true, cookieName: "token & auth_token", cookieAttributes: cookieOptions });
      }
      return response;
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }

  static async login(request, env) {
    try {
      const body = await request.json();
      const valErrors = Validators.validateLogin(body);
      if (valErrors) {
        return ApiResponse.badRequest("Validation failed", valErrors);
      }

      const { user, token } = await AuthService.login(body.email, body.password, env);

      const response = ApiResponse.success(user, "Login successful");
      response.headers.append(
        "Set-Cookie",
        `token=${token}${cookieOptions}`
      );
      response.headers.append(
        "Set-Cookie",
        `auth_token=${token}${cookieOptions}`
      );
      if (process.env.NODE_ENV !== "production") {
        console.info("AUTH LOGIN DEBUG", { status: 200, setCookie: true, cookieName: "token & auth_token", cookieAttributes: cookieOptions });
      }
      return response;
    } catch (error) {
      return ApiResponse.error(error.message, 401);
    }
  }

  static async adminLogin(request, env) {
    try {
      const body = await request.json();
      const valErrors = Validators.validateLogin(body);
      if (valErrors) {
        return ApiResponse.badRequest("Validation failed", valErrors);
      }

      const { user, token } = await AuthService.adminLogin(body.email, body.password, env);

      const response = ApiResponse.success(user, "Admin login successful");
      response.headers.append(
        "Set-Cookie",
        `admin_token=${token}${cookieOptions}`
      );
      response.headers.append(
        "Set-Cookie",
        `tharanitex_session=${token}${cookieOptions}`
      );
      return response;
    } catch (error) {
      return ApiResponse.error(error.message, 401);
    }
  }

  static async logout(request, env) {
    try {
      const response = ApiResponse.success(
        null,
        "Logged out successfully"
      );

      // Invalidate D1 session if active session cookie/header exists
      const sessionToken =
        request.cookies?.get?.("tharanitex_session")?.value ||
        request.cookies?.get?.("admin_token")?.value ||
        request.headers?.get?.("x-session-token");

      if (sessionToken) {
        await logoutSession(sessionToken, env).catch(() => {});
      }

      const cookiesToClear = [
        "token",
        "auth_token",
        "tharanitex_session",
        "admin_token",
      ];

      for (const cookieName of cookiesToClear) {
        response.headers.append(
          "Set-Cookie",
          `${cookieName}=; Path=/; HttpOnly; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`
        );
      }

      return response;
    } catch (error) {
      console.error("Logout error:", error);
      return ApiResponse.error("Unable to log out", 500);
    }
  }

  static async getProfile(request, env) {
    try {
      const payload = await authenticate(request, env);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }

      const profile = await AuthService.getProfile(payload.id);
      return ApiResponse.success(profile);
    } catch (error) {
      return ApiResponse.unauthorized("Authentication required");
    }
  }

  static async updateProfile(request, env) {
    try {
      const payload = await authenticate(request, env);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }

      const body = await request.json();
      if (!body.name) {
        return ApiResponse.badRequest("Name is required");
      }

      const updated = await AuthService.updateProfile(payload.id, body);
      return ApiResponse.success(updated, "Profile updated successfully");
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async forgotPassword(request) {
    try {
      const body = await request.json();
      if (!body.email) {
        return ApiResponse.badRequest("Email is required");
      }

      await AuthService.forgotPassword(body.email);
      return ApiResponse.success(null, "Reset password simulation link has been sent to your email.");
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }

  static async googleLogin(request, env) {
    try {
      const body = await request.json();

      if (!body.accessToken) {
        return ApiResponse.badRequest("Google access token is required");
      }

      const { user, token } = await AuthService.googleLogin(
        body.accessToken,
        env
      );

      const response = ApiResponse.success(
        user,
        "Google login successful"
      );

      response.headers.append(
        "Set-Cookie",
        `token=${token}${cookieOptions}`
      );

      response.headers.append(
        "Set-Cookie",
        `auth_token=${token}${cookieOptions}`
      );

      return response;
    } catch (error) {
      console.error("Google login error:", error);
      return ApiResponse.error(error.message, 401);
    }
  }
}

