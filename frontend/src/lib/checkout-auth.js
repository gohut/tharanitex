import { requireAuth } from "@/middleware/auth";
import { CheckoutError } from "@/lib/db/order";

export async function requireCustomer(request, env) {
  const customerId = await getCustomerId(request, env);
  if (!customerId) {
    throw new CheckoutError("Please log in before placing an order.", 401);
  }
  return customerId;
}

export async function getCustomerId(request, env) {
  const user = await requireAuth(request, env);
  return user?.userType === "customer" && user.userId ? String(user.userId) : null;
}
