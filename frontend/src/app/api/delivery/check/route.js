import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawPincode = searchParams.get("pincode") || "";

    const pincode = rawPincode.replace(/\D/g, "");

    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        {
          success: false,
          available: false,
          message: "Please enter a valid 6-digit pincode.",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          available: false,
          message:
            "Unable to check this pincode right now. Please try again.",
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    const result = Array.isArray(data) ? data[0] : null;

    if (
      !result ||
      String(result.Status || "").toLowerCase() !== "success" ||
      !Array.isArray(result.PostOffice) ||
      result.PostOffice.length === 0
    ) {
      return NextResponse.json({
        success: true,
        available: false,
        pincode,
        message:
          "We couldn't find this pincode. Please check the number and try again.",
      });
    }

    const deliveryOffices = result.PostOffice.filter(
      (office) =>
        String(office?.DeliveryStatus || "").toLowerCase() ===
        "delivery"
    );

    if (deliveryOffices.length === 0) {
      return NextResponse.json({
        success: true,
        available: false,
        pincode,
        message:
          "This pincode is currently not available for delivery.",
      });
    }

    const office = deliveryOffices[0];

    return NextResponse.json({
      success: true,
      available: true,
      pincode,
      city: office.District || office.Region || "",
      state: office.State || "",
      postOffice: office.Name || "",
      message: "Delivery is available to this location.",
      estimatedDelivery: "2–4 Business Days",
    });
  } catch (error) {
    console.error("Delivery pincode check error:", error);

    return NextResponse.json(
      {
        success: false,
        available: false,
        message:
          "Something went wrong while checking delivery availability.",
      },
      { status: 500 }
    );
  }
}