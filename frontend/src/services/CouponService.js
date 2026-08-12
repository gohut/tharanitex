import { CouponRepository } from "../repositories/CouponRepository";

export class CouponService {
  static async getCoupons() {
    return await CouponRepository.findAll();
  }

  static async getCoupon(id) {
    const coupon = await CouponRepository.findById(id);
    if (!coupon) {
      throw new Error("Coupon not found");
    }
    return coupon;
  }

  static async createCoupon(data) {
    const existing = await CouponRepository.findByCode(data.code);
    if (existing) {
      throw new Error("Coupon code already exists");
    }
    return await CouponRepository.create(data);
  }

  static async updateCoupon(id, data) {
    const coupon = await CouponRepository.findById(id);
    if (!coupon) {
      throw new Error("Coupon not found");
    }
    const existing = await CouponRepository.findByCode(data.code);
    if (existing && existing.id !== id) {
      throw new Error("Coupon code already exists");
    }
    return await CouponRepository.update(id, data);
  }

  static async deleteCoupon(id) {
    const coupon = await CouponRepository.findById(id);
    if (!coupon) {
      throw new Error("Coupon not found");
    }
    return await CouponRepository.delete(id);
  }

  static async validateCoupon(code, subtotal) {
    const coupon = await CouponRepository.findByCode(code);
    if (!coupon) {
      throw new Error("Invalid coupon code");
    }

    if (coupon.status !== "active") {
      throw new Error("Coupon is inactive");
    }

    if (new Date(coupon.expires_at) < new Date()) {
      throw new Error("Coupon has expired");
    }

    if (subtotal < coupon.min_purchase) {
      throw new Error(`Minimum purchase amount of ₹${coupon.min_purchase} required to use this coupon`);
    }

    return coupon;
  }
}
