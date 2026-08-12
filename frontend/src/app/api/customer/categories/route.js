import { CategoryController } from "@/controllers/CategoryController";

export const runtime = "edge";

export async function GET(request) {
  return await CategoryController.getCategories(request);
}
