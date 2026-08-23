import {
  ReviewController,
} from "@/controllers/ReviewController";

export const runtime = "nodejs";

export async function GET(request) {
  return await ReviewController.adminGetReviews(
    request
  );
}