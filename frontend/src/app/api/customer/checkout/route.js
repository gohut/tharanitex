import { OrderController } from "@/controllers/OrderController";

export const runtime = "edge";

export async function POST(request) {
  return await OrderController.checkout(request);
}
