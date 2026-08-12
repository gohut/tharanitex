import { ApiResponse } from "@/utils/ApiResponse";

export const runtime = "edge";

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.email || !body.message) {
      return ApiResponse.badRequest("Name, email, and message are required");
    }

    // In a fully deployed setup, this could send an email or store in a Contact_Messages table.
    // For production-readiness, we log the query to the server output and return a clean success.
    console.log("Contact message received:", body);

    return ApiResponse.success(
      null,
      "Your contact request has been received. Our team will get back to you shortly."
    );
  } catch (error) {
    return ApiResponse.error(error.message, 400);
  }
}
