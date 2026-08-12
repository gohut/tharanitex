import { AnalyticsService } from "../services/AnalyticsService";
import { ApiResponse } from "../utils/ApiResponse";
import { authenticateAdmin } from "../middleware/auth";

export class AnalyticsController {
  static async getDashboardStats(request) {
    try {
      if (!await authenticateAdmin(request)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const stats = await AnalyticsService.getDashboardStats();
      return ApiResponse.success(stats);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async getDetailedAnalytics(request) {
    try {
      if (!await authenticateAdmin(request)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const analytics = await AnalyticsService.getDetailedAnalytics();
      return ApiResponse.success(analytics);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }
}
