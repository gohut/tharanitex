import { CouponController } from "@/controllers/CouponController";

export const runtime = "edge";

export async function GET(request) {
  return await CouponController.validateCoupon(request);
}
