import { AuthService } from "../services/AuthService";
import { Validators } from "../validators/validators";
import { ApiResponse } from "../utils/ApiResponse";
import { authenticate } from "../middleware/auth";

const isProd = process.env.NODE_ENV === "production";
const secureFlag = isProd ? "; Secure" : "";
const cookieOptions = `; Path=/; HttpOnly; Max-Age=86400; SameSite=Lax${secureFlag}`;
const expireCookieOptions = `; Path=/; HttpOnly; Max-Age=0; SameSite=Lax${secureFlag}`;

export class AuthController {
  static async register(request) {
    try {
      const body = await request.json();
      const valErrors = Validators.validateRegister(body);
      if (valErrors) {
        return ApiResponse.badRequest("Validation failed", valErrors);
      }

      const { user, token } = await AuthService.register(body);

      const response = ApiResponse.success(user, "User registered successfully", 201);
      response.headers.set(
        "Set-Cookie",
        `token=${token}${cookieOptions}`
      );
      return response;
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }

  static async login(request) {
    try {
      const body = await request.json();
      const valErrors = Validators.validateLogin(body);
      if (valErrors) {
        return ApiResponse.badRequest("Validation failed", valErrors);
      }

      const { user, token } = await AuthService.login(body.email, body.password);

      const response = ApiResponse.success(user, "Login successful");
      response.headers.set(
        "Set-Cookie",
        `token=${token}${cookieOptions}`
      );
      return response;
    } catch (error) {
      return ApiResponse.error(error.message, 401);
    }
  }

  static async logout(request) {
    try {
      const response = ApiResponse.success(null, "Logged out successfully");
      response.headers.set(
        "Set-Cookie",
        `token=${expireCookieOptions}`
      );
      return response;
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async adminLogin(request) {
    try {
      const body = await request.json();
      const valErrors = Validators.validateLogin(body);
      if (valErrors) {
        return ApiResponse.badRequest("Validation failed", valErrors);
      }

      const { user, token } = await AuthService.adminLogin(body.email, body.password);

      const response = ApiResponse.success(user, "Admin login successful");
      response.headers.set(
        "Set-Cookie",
        `admin_token=${token}${cookieOptions}`
      );
      return response;
    } catch (error) {
      return ApiResponse.error(error.message, 401);
    }
  }

  static async adminLogout(request) {
    try {
      const response = ApiResponse.success(null, "Admin logged out successfully");
      response.headers.set(
        "Set-Cookie",
        `admin_token=${expireCookieOptions}`
      );
      return response;
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async getProfile(request) {
    try {
      const payload = await authenticate(request);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }

      const profile = await AuthService.getProfile(payload.id);
      return ApiResponse.success(profile);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async updateProfile(request) {
    try {
      const payload = await authenticate(request);
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
