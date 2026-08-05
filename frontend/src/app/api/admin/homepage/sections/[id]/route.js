import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  updateHomepageSection,
  deleteHomepageSection,
} from "@/lib/db/homepage";


export async function PATCH(request, { params }) {
  try {
    const { env } = getCloudflareContext();

    const { id } = await params;
    const body = await request.json();

    await updateHomepageSection(
      env.DB,
      id,
      body
    );

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error("Homepage section PATCH error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to update homepage section",
      },
      { status: 500 }
    );
  }
}


export async function DELETE(request, { params }) {
  try {
    const { env } = getCloudflareContext();

    const { id } = await params;

    await deleteHomepageSection(
      env.DB,
      id
    );

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error("Homepage section DELETE error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to delete homepage section",
      },
      { status: 500 }
    );
  }
}