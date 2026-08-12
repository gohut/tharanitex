import { AuthController } from "@/controllers/AuthController";
import { ApiResponse } from "@/utils/ApiResponse";
import { authenticateAdmin } from "@/middleware/auth";

export const runtime = "edge";

export async function GET(request) {
  if (!await authenticateAdmin(request)) {
    return ApiResponse.forbidden("Admin access required");
  }
  return await AuthController.getProfile(request);
}
