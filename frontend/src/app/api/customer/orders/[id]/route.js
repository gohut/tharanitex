import { OrderController } from "@/controllers/OrderController";

export const runtime = "edge";

export async function GET(request, { params }) {
  return await OrderController.getCustomerOrderById(request, { params });
}
