import {
  ReviewController,
} from "@/controllers/ReviewController";

export const runtime = "nodejs";

export async function DELETE(
  request,
  { params }
) {
  return await ReviewController.adminDeleteReview(
    request,
    { params }
  );
}