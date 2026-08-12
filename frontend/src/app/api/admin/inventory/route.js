import { ProductController } from "@/controllers/ProductController";

export const runtime = "edge";

export async function GET(request) {
  // Inventory view is essentially products list with their stock levels
  return await ProductController.adminGetProducts(request);
}
