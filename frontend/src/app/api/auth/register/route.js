import { AuthController } from "@/controllers/AuthController";

export const runtime = "edge";

export async function POST(request) {
  return await AuthController.register(request);
}
