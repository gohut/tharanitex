import { ReviewController } from "@/controllers/ReviewController";

export const runtime = "nodejs";

export async function POST(request) {
  return await ReviewController.addProductReview(request);
}