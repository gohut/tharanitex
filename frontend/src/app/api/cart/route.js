import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} from "@/lib/db/cart";
import { requireCustomer } from "@/lib/checkout-auth";

export async function GET(request) {
  const { env } = await getCloudflareContext({ async: true });

  try {
    const userId = await requireCustomer(request, env);
    return Response.json(await getCart(env.DB, userId));
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: error.status || 401 }
    );
  }
}

export async function POST(request) {
  const { env } = await getCloudflareContext({ async: true });

  try {
    const body = await request.json();
    const userId = await requireCustomer(request, env);

    return Response.json(
      await addToCart(
        env.DB,
        userId,
        body.productId,
        body.variantId ?? null,
        body.quantity
      )
    );
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: error.status || 400 }
    );
  }
}

export async function PATCH(request) {
  const { env } = await getCloudflareContext({ async: true });

  try {
    const body = await request.json();
    const userId = await requireCustomer(request, env);

    return Response.json(
      await updateCartQuantity(
        env.DB,
        userId,
        body.cartId,
        body.quantity
      )
    );
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: error.status || 400 }
    );
  }
}

export async function DELETE(request) {
  const { env } = await getCloudflareContext({ async: true });

  try {
    const userId = await requireCustomer(request, env);
    const cartId = new URL(request.url).searchParams.get("cartId");

    return Response.json(
      await removeFromCart(env.DB, userId, cartId)
    );
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: error.status || 400 }
    );
  }
}