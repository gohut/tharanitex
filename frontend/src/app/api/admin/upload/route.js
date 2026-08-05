import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request) {
  try {
    const { env } = getCloudflareContext();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    if (!file.type?.startsWith("image/")) {
      return Response.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    const extension =
      file.name?.split(".").pop()?.toLowerCase() || "jpg";

    const requestedFolder = formData.get("folder");
    const folder =
      typeof requestedFolder === "string" &&
      ["products", "categories", "homepage"].includes(requestedFolder)
        ? requestedFolder
        : "products";

    const key = `${folder}/${crypto.randomUUID()}.${extension}`;

    await env.tharani_product_images.put(
      key,
      await file.arrayBuffer(),
      {
        httpMetadata: {
          contentType: file.type,
        },
      }
    );

    return Response.json({
      success: true,
      key,
      url: `/api/images/${key}`,
    });
  } catch (error) {
    console.error("Image upload error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Image upload failed",
      },
      { status: 500 }
    );
  }
}
