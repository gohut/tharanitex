import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET() {
  try {
    const { env } = getCloudflareContext();

    const { results } = await env.DB
      .prepare(`
        SELECT id, name
        FROM categories
        ORDER BY name ASC
      `)
      .all();

    return Response.json(results);
  } catch (error) {
    console.error("Categories GET error:", error);

    return Response.json(
      { error: "Failed to load categories" },
      { status: 500 }
    );
  }
}