import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  getCustomerById,
  updateCustomerStatus,
} from "@/lib/db/customer";

export async function GET(request, { params }) {
  try {
    const { env } = getCloudflareContext();
    const { id } = await params;

    const customer = await getCustomerById(
      env.DB,
      id
    );

    if (!customer) {
      return Response.json(
        {
          success: false,
          error: "Customer not found",
        },
        { status: 404 }
      );
    }

    return Response.json(customer);
  } catch (error) {
    console.error(
      "Admin customer GET error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          error.message ||
          "Failed to load customer",
      },
      { status: 500 }
    );
  }
}


export async function PATCH(request, { params }) {
  try {
    const { env } = getCloudflareContext();
    const { id } = await params;

    const body = await request.json();

    if (typeof body.isActive !== "boolean") {
      return Response.json(
        {
          success: false,
          error: "isActive must be a boolean",
        },
        { status: 400 }
      );
    }

    const result = await updateCustomerStatus(
      env.DB,
      id,
      body.isActive
    );

    if (!result.success) {
      return Response.json(
        result,
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Admin customer PATCH error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          error.message ||
          "Failed to update customer",
      },
      { status: 500 }
    );
  }
}