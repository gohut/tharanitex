import { ReviewController } from "@/controllers/ReviewController";

export const runtime = "edge";

export async function PUT(request, { params }) {
  return await ReviewController.adminApproveReview(request, { params });
}
