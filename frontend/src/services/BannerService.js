import { BannerRepository } from "../repositories/BannerRepository";

export class BannerService {
  static async getBanners() {
    return await BannerRepository.findAll();
  }

  static async getBanner(id) {
    const banner = await BannerRepository.findById(id);
    if (!banner) {
      throw new Error("Banner not found");
    }
    return banner;
  }

  static async createBanner(data) {
    return await BannerRepository.create(data);
  }

  static async updateBanner(id, data) {
    const banner = await BannerRepository.findById(id);
    if (!banner) {
      throw new Error("Banner not found");
    }
    return await BannerRepository.update(id, data);
  }

  static async deleteBanner(id) {
    const banner = await BannerRepository.findById(id);
    if (!banner) {
      throw new Error("Banner not found");
    }
    return await BannerRepository.delete(id);
  }
}
