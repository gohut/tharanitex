import { AuthController } from "@/controllers/AuthController";

export async function POST(request) {
  return await AuthController.logout(request);
}