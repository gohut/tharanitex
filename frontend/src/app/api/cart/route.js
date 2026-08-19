import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} from "@/lib/db/cart";

export async function GET(request) {
  const { env } = getCloudflareContext();

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "guest";

  return Response.json(await getCart(env.DB, userId));
}

export async function POST(request) {
  try {
    const { env } = getCloudflareContext();

    const body = await request.json();

    const result = await addToCart(
      env.DB,
      body.userId || "guest",
      body.productId,
      body.variantId ?? null,
      body.quantity
    );

    return Response.json(result);
  } catch (error) {
    console.error("Cart POST error:", error);

    return Response.json(
      {
        success: false,
        error:
          error.message ||
          "Unable to add item to cart",
      },
      { status: 400 }
    );
  }
}

export async function PATCH(request) {
  const { env } = getCloudflareContext();

  const body = await request.json();

  return Response.json(
    await updateCartQuantity(
      env.DB,
      body.cartId,
      body.quantity
    )
  );
}

export async function DELETE(request) {
  const { env } = getCloudflareContext();

  const { searchParams } = new URL(request.url);

  const cartId = searchParams.get("cartId");

  return Response.json(
    await removeFromCart(env.DB, cartId)
  );
}