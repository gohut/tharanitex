import { getCloudflareContext } from "@opennextjs/cloudflare";
import { addToCart, getCart, updateCartQuantity, removeFromCart } from "@/lib/db/cart";

export async function GET(request) {
  const { env } = await getCloudflareContext({ async: true });
  const userId = new URL(request.url).searchParams.get("userId") || "guest";
  return Response.json(await getCart(env.DB, userId));
}
export async function POST(request) {
  const { env } = await getCloudflareContext({ async: true });
  const body = await request.json();
  return Response.json(await addToCart(env.DB, body.userId || "guest", body.productId, body.quantity));
}
export async function PATCH(request) {
  const { env } = await getCloudflareContext({ async: true });
  const body = await request.json();
  return Response.json(await updateCartQuantity(env.DB, body.cartId, body.quantity));
}
export async function DELETE(request) {
  const { env } = await getCloudflareContext({ async: true });
  const cartId = new URL(request.url).searchParams.get("cartId");
  return Response.json(await removeFromCart(env.DB, cartId));
}
