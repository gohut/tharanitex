import { ReviewController } from "@/controllers/ReviewController";

export const runtime = "edge";

export async function POST(request) {
  return await ReviewController.addProductReview(request);
}
