import { CouponController } from "@/controllers/CouponController";

export const runtime = "edge";

export async function PUT(request, { params }) {
  return await CouponController.adminUpdateCoupon(request, { params });
}

export async function DELETE(request, { params }) {
  return await CouponController.adminDeleteCoupon(request, { params });
}
