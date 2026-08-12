import { WishlistController } from "@/controllers/WishlistController";

export const runtime = "edge";

export async function DELETE(request, { params }) {
  return await WishlistController.removeFromWishlist(request, { params });
}
