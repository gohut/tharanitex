import { OrderController } from "@/controllers/OrderController";

export const runtime = "edge";

export async function GET(request, { params }) {
  // Let admin reuse the customer get order by id controller
  return await OrderController.getCustomerOrderById(request, { params });
}

export async function PUT(request, { params }) {
  return await OrderController.adminUpdateOrderStatus(request, { params });
}
