import { PaymentController } from "@/controllers/PaymentController";

export const runtime = "edge";

export async function POST(request) {
  return await PaymentController.initializePayment(request);
}
