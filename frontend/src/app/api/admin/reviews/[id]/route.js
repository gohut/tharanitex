import { ReviewController } from "@/controllers/ReviewController";

export const runtime = "edge";

export async function DELETE(request, { params }) {
  return await ReviewController.adminDeleteReview(request, { params });
}
