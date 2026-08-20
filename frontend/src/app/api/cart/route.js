import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} from "@/lib/db/cart";
import { requireCustomer } from "@/lib/checkout-auth";

async function customerId(request, env) {
  return requireCustomer(request, env);
}

export async function GET(request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return Response.json(await getCart(env.DB, await customerId(request, env)));
  } catch (error) {
    return Response.json({ error: error.message }, { status: error.status || 401 });
  }
}

export async function POST(request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const body = await request.json();
    return Response.json(await addToCart(
      env.DB,
      await customerId(request, env),
      body.productId,
      body.variantId ?? null,
      body.quantity,
    ));
  } catch (error) {
    return Response.json({ success: false, error: error.message || "Unable to add item to cart" }, { status: error.status || 400 });
  }
}

export async function PATCH(request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const body = await request.json();
    return Response.json(await updateCartQuantity(
      env.DB,
      await customerId(request, env),
      body.cartId,
      body.quantity,
    ));
  } catch (error) {
    return Response.json({ error: error.message }, { status: error.status || 400 });
  }
}

export async function DELETE(request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const cartId = new URL(request.url).searchParams.get("cartId");
    return Response.json(await removeFromCart(env.DB, await customerId(request, env), cartId));
  } catch (error) {
    return Response.json({ error: error.message }, { status: error.status || 400 });
  }
}
