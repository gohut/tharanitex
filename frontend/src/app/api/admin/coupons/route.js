import { CouponController } from "@/controllers/CouponController";

export const runtime = "edge";

export async function GET(request) {
  return await CouponController.adminGetCoupons(request);
}

export async function POST(request) {
  return await CouponController.adminCreateCoupon(request);
}
