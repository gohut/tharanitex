import { ReviewController } from "@/controllers/ReviewController";

export const runtime = "edge";

export async function GET(request) {
  return await ReviewController.adminGetReviews(request);
}
