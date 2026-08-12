import { CartController } from "@/controllers/CartController";

export const runtime = "edge";

export async function GET(request) {
  return await CartController.getCart(request);
}

export async function POST(request) {
  return await CartController.addToCart(request);
}
