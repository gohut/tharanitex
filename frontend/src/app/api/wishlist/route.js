import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/lib/db/wishlist";

export async function GET(request) {
  const { env } = getCloudflareContext();

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "guest";

  return Response.json(await getWishlist(env.DB, userId));
}

export async function POST(request) {
  const { env } = getCloudflareContext();

  const body = await request.json();

  return Response.json(
    await addToWishlist(
      env.DB,
      body.userId,
      body.productId
    )
  );
}

export async function DELETE(request) {
  const { env } = getCloudflareContext();

  const body = await request.json();

  return Response.json(
    await removeFromWishlist(
      env.DB,
      body.userId,
      body.productId
    )
  );
}