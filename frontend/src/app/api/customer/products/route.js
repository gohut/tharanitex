import { ProductController } from "@/controllers/ProductController";

export const runtime = "edge";

export async function GET(request) {
  return await ProductController.queryProducts(request);
}
