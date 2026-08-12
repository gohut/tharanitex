import { OrderController } from "@/controllers/OrderController";

export const runtime = "edge";

export async function GET(request) {
  return await OrderController.adminGetOrders(request);
}
