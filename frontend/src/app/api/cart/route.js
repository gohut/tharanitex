import { getCloudflareContext } from "@opennextjs/cloudflare";
import { addToCart, getCart, updateCartQuantity, removeFromCart } from "@/lib/db/cart";
import { requireCustomer } from "@/lib/checkout-auth";

export async function GET(request) {
  const { env } = await getCloudflareContext({ async: true });
  try { return Response.json(await getCart(env.DB, await requireCustomer(request, env))); }
  catch (error) { return Response.json({ error: error.message }, { status: error.status || 401 }); }
}
export async function POST(request) {
  const { env } = await getCloudflareContext({ async: true });
  try {
    const body = await request.json();
    return Response.json(await addToCart(env.DB, await requireCustomer(request, env), body.productId, body.quantity));
  } catch (error) { return Response.json({ error: error.message }, { status: error.status || 400 }); }
}
export async function PATCH(request) {
  const { env } = await getCloudflareContext({ async: true });
  try {
    const body = await request.json();
    return Response.json(await updateCartQuantity(env.DB, await requireCustomer(request, env), body.cartId, body.quantity));
  } catch (error) { return Response.json({ error: error.message }, { status: error.status || 400 }); }
}
export async function DELETE(request) {
  const { env } = await getCloudflareContext({ async: true });
  try { return Response.json(await removeFromCart(env.DB, await requireCustomer(request, env), new URL(request.url).searchParams.get("cartId"))); }
  catch (error) { return Response.json({ error: error.message }, { status: error.status || 400 }); }
}
