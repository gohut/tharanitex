import { AuthController } from "@/controllers/AuthController";

export const runtime = "edge";

export async function GET(request) {
  return await AuthController.getProfile(request);
}

export async function PUT(request) {
  return await AuthController.updateProfile(request);
}
