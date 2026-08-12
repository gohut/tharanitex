import { BannerController } from "@/controllers/BannerController";

export const runtime = "edge";

export async function GET(request) {
  return await BannerController.getBanners(request);
}

export async function POST(request) {
  return await BannerController.adminCreateBanner(request);
}
