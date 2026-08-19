import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/lib/db/wishlist";
import { requireCustomer } from "@/lib/checkout-auth";

export async function GET(request) {
  const { env } = await getCloudflareContext({ async: true });
  try { return Response.json(await getWishlist(env.DB, await requireCustomer(request, env))); }
  catch (error) { return Response.json({ error: error.message }, { status: error.status || 401 }); }
}

export async function POST(request) {
  const { env } = await getCloudflareContext({ async: true });
  try { const body = await request.json(); return Response.json(await addToWishlist(env.DB, await requireCustomer(request, env), body.productId)); }
  catch (error) { return Response.json({ error: error.message }, { status: error.status || 400 }); }
}

export async function DELETE(request) {
  const { env } = await getCloudflareContext({ async: true });
  try { const body = await request.json(); return Response.json(await removeFromWishlist(env.DB, await requireCustomer(request, env), body.productId)); }
  catch (error) { return Response.json({ error: error.message }, { status: error.status || 400 }); }
}
