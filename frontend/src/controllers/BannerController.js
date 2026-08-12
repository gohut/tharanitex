import { BannerService } from "../services/BannerService";
import { Validators } from "../validators/validators";
import { ApiResponse } from "../utils/ApiResponse";
import { authenticateAdmin } from "../middleware/auth";

export class BannerController {
  static async getBanners(request) {
    try {
      const banners = await BannerService.getBanners();
      return ApiResponse.success(banners);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async adminCreateBanner(request) {
    try {
      if (!await authenticateAdmin(request)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const body = await request.json();
      const valErrors = Validators.validateBanner(body);
      if (valErrors) {
        return ApiResponse.badRequest("Validation failed", valErrors);
      }

      const banner = await BannerService.createBanner(body);
      return ApiResponse.success(banner, "Banner created successfully", 201);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async adminUpdateBanner(request, { params }) {
    try {
      if (!await authenticateAdmin(request)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const resolvedParams = await params;
      const id = resolvedParams.id;
      const body = await request.json();
      const valErrors = Validators.validateBanner(body);
      if (valErrors) {
        return ApiResponse.badRequest("Validation failed", valErrors);
      }

      const banner = await BannerService.updateBanner(id, body);
      return ApiResponse.success(banner, "Banner updated successfully");
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async adminDeleteBanner(request, { params }) {
    try {
      if (!await authenticateAdmin(request)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const resolvedParams = await params;
      const id = resolvedParams.id;

      await BannerService.deleteBanner(id);
      return ApiResponse.success(null, "Banner deleted successfully");
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }
}
