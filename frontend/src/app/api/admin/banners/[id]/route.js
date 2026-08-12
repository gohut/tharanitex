import { BannerController } from "@/controllers/BannerController";

export const runtime = "edge";

export async function PUT(request, { params }) {
  return await BannerController.adminUpdateBanner(request, { params });
}

export async function DELETE(request, { params }) {
  return await BannerController.adminDeleteBanner(request, { params });
}
