import { PaymentService } from "../services/PaymentService";
import { ApiResponse } from "../utils/ApiResponse";
import { authenticate } from "../middleware/auth";

export class PaymentController {
  static async initializePayment(request) {
    try {
      const payload = await authenticate(request);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }
      const body = await request.json();
      if (!body.order_id || !body.method) {
        return ApiResponse.badRequest("Order ID and method are required");
      }

      const session = await PaymentService.initializePayment(body.order_id, body.method);
      return ApiResponse.success(session);
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }

  static async handleWebhook(request) {
    try {
      const body = await request.json();
      const result = await PaymentService.handleWebhook(body);
      return ApiResponse.success(result);
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }
}
