import { AnalyticsService } from "../services/AnalyticsService";
import { ApiResponse } from "../utils/ApiResponse";
import { authenticateAdmin } from "../middleware/auth";

export class AnalyticsController {
  static async getDashboardStats(request, env) {
    try {
      if (!await authenticateAdmin(request, env)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const stats = await AnalyticsService.getDashboardStats();
      return ApiResponse.success(stats);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async getDetailedAnalytics(request, env) {
    try {
      if (!await authenticateAdmin(request, env)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const analytics = await AnalyticsService.getDetailedAnalytics();
      return ApiResponse.success(analytics);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }
}

