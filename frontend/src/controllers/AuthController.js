import { AuthService } from "../services/AuthService";
import { Validators } from "../validators/validators";
import { ApiResponse } from "../utils/ApiResponse";
import { requireAuth } from "../middleware/auth";
import { buildClearCookieHeader, buildSessionCookieHeader, logoutSession } from "../lib/auth";

export class AuthController {
  static async register(request, env) {
    try {
      const body = await request.json();
      const valErrors = Validators.validateRegister(body);
      if (valErrors) {
        return ApiResponse.badRequest("Validation failed", valErrors);
      }

      const { user, sessionToken, token, expiresAt } = await AuthService.register(body, env);

      const response = ApiResponse.success(user, "User registered successfully", 201);
      const activeToken = sessionToken || token;
      response.headers.append("Set-Cookie", buildSessionCookieHeader(activeToken));
      if (token) {
        response.headers.append("Set-Cookie", `token=${token}; Path=/; SameSite=Lax; Max-Age=604800`);
      }
      if (expiresAt) response.headers.set("X-Session-Expires-At", expiresAt);
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

      const { user, sessionToken, token, expiresAt } = await AuthService.login(body.email, body.password, env);

      const response = ApiResponse.success(user, "Login successful");
      const activeToken = sessionToken || token;
      response.headers.append("Set-Cookie", buildSessionCookieHeader(activeToken));
      if (token) {
        response.headers.append("Set-Cookie", `token=${token}; Path=/; SameSite=Lax; Max-Age=604800`);
      }
      if (expiresAt) response.headers.set("X-Session-Expires-At", expiresAt);
      return response;
    } catch (error) {
      return ApiResponse.error(error.message, 401);
    }
  }

  static async logout(request, env) {
    try {
      const response = ApiResponse.success(null, "Logged out successfully");
      const token = request.cookies?.get?.("tharanitex_session")?.value;
      if (token) await logoutSession(token, env);
      response.headers.append("Set-Cookie", buildClearCookieHeader());
      return response;
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async getProfile(request, env) {
    try {
      const payload = await requireAuth(request, env);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }

      const profile = await AuthService.getProfile(payload.id);
      return ApiResponse.success(profile);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async updateProfile(request, env) {
    try {
      const payload = await requireAuth(request, env);
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
}
