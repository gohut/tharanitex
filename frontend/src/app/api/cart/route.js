import { getCloudflareContext } from "@opennextjs/cloudflare";
import { addToCart, getCart, updateCartQuantity, removeFromCart } from "@/lib/db/cart";
import { requireCustomer } from "@/lib/checkout-auth";

async function customer(request) {
  const { env } = await getCloudflareContext({ async: true });
  return { env, userId: await requireCustomer(request, env) };
}

export async function GET(request) {
  try { const { env, userId } = await customer(request); return Response.json(await getCart(env.DB, userId)); }
  catch (error) { return Response.json({ error: error.message || "Unable to load cart." }, { status: error.status || 500 }); }
}
export async function POST(request) {
  try { const { env, userId } = await customer(request); const body = await request.json(); return Response.json(await addToCart(env.DB, userId, body.productId, body.quantity)); }
  catch (error) { return Response.json({ error: error.message || "Unable to update cart." }, { status: error.status || 500 }); }
}
export async function PATCH(request) {
  try { const { env, userId } = await customer(request); const body = await request.json(); const item = await env.DB.prepare("SELECT id FROM cart_items WHERE id = ? AND user_id = ?").bind(body.cartId, userId).first(); if (!item) return Response.json({ error: "Cart item not found." }, { status: 404 }); return Response.json(await updateCartQuantity(env.DB, body.cartId, body.quantity)); }
  catch (error) { return Response.json({ error: error.message || "Unable to update cart." }, { status: error.status || 500 }); }
}
export async function DELETE(request) {
  try { const { env, userId } = await customer(request); const cartId = new URL(request.url).searchParams.get("cartId"); const item = await env.DB.prepare("SELECT id FROM cart_items WHERE id = ? AND user_id = ?").bind(cartId, userId).first(); if (!item) return Response.json({ error: "Cart item not found." }, { status: 404 }); return Response.json(await removeFromCart(env.DB, cartId)); }
  catch (error) { return Response.json({ error: error.message || "Unable to update cart." }, { status: error.status || 500 }); }
}
