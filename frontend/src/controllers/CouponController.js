import { CouponService } from "../services/CouponService";
import { Validators } from "../validators/validators";
import { ApiResponse } from "../utils/ApiResponse";
import { authenticate, authenticateAdmin } from "../middleware/auth";

export class CouponController {
  static async adminGetCoupons(request) {
    try {
      if (!await authenticateAdmin(request)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const coupons = await CouponService.getCoupons();
      return ApiResponse.success(coupons);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async adminCreateCoupon(request) {
    try {
      if (!await authenticateAdmin(request)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const body = await request.json();
      const valErrors = Validators.validateCoupon(body);
      if (valErrors) {
        return ApiResponse.badRequest("Validation failed", valErrors);
      }

      const coupon = await CouponService.createCoupon(body);
      return ApiResponse.success(coupon, "Coupon created successfully", 201);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async adminUpdateCoupon(request, { params }) {
    try {
      if (!await authenticateAdmin(request)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const resolvedParams = await params;
      const id = resolvedParams.id;
      const body = await request.json();
      const valErrors = Validators.validateCoupon(body);
      if (valErrors) {
        return ApiResponse.badRequest("Validation failed", valErrors);
      }

      const coupon = await CouponService.updateCoupon(id, body);
      return ApiResponse.success(coupon, "Coupon updated successfully");
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async adminDeleteCoupon(request, { params }) {
    try {
      if (!await authenticateAdmin(request)) {
        return ApiResponse.forbidden("Admin access required");
      }
      const resolvedParams = await params;
      const id = resolvedParams.id;

      await CouponService.deleteCoupon(id);
      return ApiResponse.success(null, "Coupon deleted successfully");
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async validateCoupon(request) {
    try {
      const payload = await authenticate(request);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }

      const { searchParams } = new URL(request.url);
      const code = searchParams.get("code");
      const subtotal = searchParams.get("subtotal") ? Number(searchParams.get("subtotal")) : 0;

      if (!code) {
        return ApiResponse.badRequest("Coupon code is required");
      }

      const coupon = await CouponService.validateCoupon(code, subtotal);
      return ApiResponse.success(coupon, "Coupon is valid");
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }
}
