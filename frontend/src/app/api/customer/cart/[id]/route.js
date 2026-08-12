import { CartController } from "@/controllers/CartController";

export const runtime = "edge";

export async function PUT(request, { params }) {
  return await CartController.updateCartItem(request, { params });
}

export async function DELETE(request, { params }) {
  return await CartController.deleteCartItem(request, { params });
}
