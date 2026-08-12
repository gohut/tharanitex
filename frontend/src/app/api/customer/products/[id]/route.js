import { ProductController } from "@/controllers/ProductController";

export const runtime = "edge";

export async function GET(request, { params }) {
  return await ProductController.getProductById(request, { params });
}
