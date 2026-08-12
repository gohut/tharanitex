import { WishlistController } from "@/controllers/WishlistController";

export const runtime = "edge";

export async function GET(request) {
  return await WishlistController.getWishlist(request);
}

export async function POST(request) {
  return await WishlistController.addToWishlist(request);
}
