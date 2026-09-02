import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const REGION_PREFIX_MAP = {
  "11": { state: "Delhi", region: "National Capital Region", estimate: "3–5 Business Days" },
  "12": { state: "Haryana", region: "Haryana", estimate: "3–5 Business Days" },
  "13": { state: "Haryana", region: "Haryana", estimate: "3–5 Business Days" },
  "14": { state: "Punjab", region: "Punjab", estimate: "3–5 Business Days" },
  "15": { state: "Punjab", region: "Punjab", estimate: "3–5 Business Days" },
  "16": { state: "Chandigarh", region: "Chandigarh", estimate: "3–5 Business Days" },
  "17": { state: "Himachal Pradesh", region: "Himachal Pradesh", estimate: "4–6 Business Days" },
  "18": { state: "Jammu & Kashmir", region: "Jammu & Kashmir", estimate: "4–6 Business Days" },
  "19": { state: "Jammu & Kashmir", region: "Kashmir & Ladakh", estimate: "4–6 Business Days" },
  "20": { state: "Uttar Pradesh", region: "Western Uttar Pradesh", estimate: "3–5 Business Days" },
  "21": { state: "Uttar Pradesh", region: "Southern Uttar Pradesh", estimate: "3–5 Business Days" },
  "22": { state: "Uttar Pradesh", region: "Central Uttar Pradesh", estimate: "3–5 Business Days" },
  "23": { state: "Uttar Pradesh", region: "Eastern Uttar Pradesh", estimate: "3–5 Business Days" },
  "24": { state: "Uttar Pradesh", region: "Northern Uttar Pradesh", estimate: "3–5 Business Days" },
  "25": { state: "Uttar Pradesh", region: "Western Uttar Pradesh", estimate: "3–5 Business Days" },
  "26": { state: "Uttarakhand", region: "Uttarakhand", estimate: "3–5 Business Days" },
  "27": { state: "Uttar Pradesh", region: "Eastern Uttar Pradesh", estimate: "3–5 Business Days" },
  "28": { state: "Uttar Pradesh", region: "Bundelkhand", estimate: "3–5 Business Days" },
  "30": { state: "Rajasthan", region: "Jaipur Region", estimate: "3–5 Business Days" },
  "31": { state: "Rajasthan", region: "Southern Rajasthan", estimate: "3–5 Business Days" },
  "32": { state: "Rajasthan", region: "Kota Region", estimate: "3–5 Business Days" },
  "33": { state: "Rajasthan", region: "Bikaner Region", estimate: "3–5 Business Days" },
  "34": { state: "Rajasthan", region: "Jodhpur Region", estimate: "3–5 Business Days" },
  "36": { state: "Gujarat", region: "Saurashtra Region", estimate: "3–5 Business Days" },
  "37": { state: "Gujarat", region: "Kutch Region", estimate: "3–5 Business Days" },
  "38": { state: "Gujarat", region: "Ahmedabad Region", estimate: "3–5 Business Days" },
  "39": { state: "Gujarat", region: "Surat Region", estimate: "3–5 Business Days" },
  "40": { state: "Maharashtra", region: "Mumbai & Goa", estimate: "3–5 Business Days" },
  "41": { state: "Maharashtra", region: "Pune Region", estimate: "3–5 Business Days" },
  "42": { state: "Maharashtra", region: "Nashik Region", estimate: "3–5 Business Days" },
  "43": { state: "Maharashtra", region: "Aurangabad Region", estimate: "3–5 Business Days" },
  "44": { state: "Maharashtra", region: "Nagpur Region", estimate: "3–5 Business Days" },
  "45": { state: "Madhya Pradesh", region: "Indore Region", estimate: "3–5 Business Days" },
  "46": { state: "Madhya Pradesh", region: "Bhopal Region", estimate: "3–5 Business Days" },
  "47": { state: "Madhya Pradesh", region: "Gwalior Region", estimate: "3–5 Business Days" },
  "48": { state: "Madhya Pradesh", region: "Jabalpur Region", estimate: "3–5 Business Days" },
  "49": { state: "Chhattisgarh", region: "Chhattisgarh", estimate: "3–5 Business Days" },
  "50": { state: "Telangana", region: "Hyderabad Region", estimate: "2–4 Business Days" },
  "51": { state: "Andhra Pradesh", region: "Rayalaseema Region", estimate: "2–4 Business Days" },
  "52": { state: "Andhra Pradesh", region: "Coastal Andhra", estimate: "2–4 Business Days" },
  "53": { state: "Andhra Pradesh", region: "Visakhapatnam Region", estimate: "2–4 Business Days" },
  "56": { state: "Karnataka", region: "Bengaluru Region", estimate: "2–4 Business Days" },
  "57": { state: "Karnataka", region: "South Karnataka", estimate: "2–4 Business Days" },
  "58": { state: "Karnataka", region: "North Karnataka", estimate: "2–4 Business Days" },
  "59": { state: "Karnataka", region: "Belagavi Region", estimate: "2–4 Business Days" },
  "60": { state: "Tamil Nadu", region: "Chennai Region", estimate: "2–3 Business Days" },
  "61": { state: "Tamil Nadu", region: "Thanjavur Region", estimate: "2–3 Business Days" },
  "62": { state: "Tamil Nadu", region: "Madurai Region", estimate: "2–3 Business Days" },
  "63": { state: "Tamil Nadu", region: "Salem Region", estimate: "2–3 Business Days" },
  "64": { state: "Tamil Nadu", region: "Coimbatore Region", estimate: "2–3 Business Days" },
  "67": { state: "Kerala", region: "Kozhikode Region", estimate: "2–4 Business Days" },
  "68": { state: "Kerala", region: "Kochi Region", estimate: "2–4 Business Days" },
  "69": { state: "Kerala", region: "Thiruvananthapuram", estimate: "2–4 Business Days" },
  "70": { state: "West Bengal", region: "Kolkata Region", estimate: "3–5 Business Days" },
  "71": { state: "West Bengal", region: "South Bengal", estimate: "3–5 Business Days" },
  "72": { state: "West Bengal", region: "Midnapore Region", estimate: "3–5 Business Days" },
  "73": { state: "West Bengal", region: "North Bengal & Sikkim", estimate: "3–5 Business Days" },
  "74": { state: "West Bengal", region: "Central Bengal", estimate: "3–5 Business Days" },
  "75": { state: "Odisha", region: "Bhubaneswar Region", estimate: "3–5 Business Days" },
  "76": { state: "Odisha", region: "Berhampur Region", estimate: "3–5 Business Days" },
  "77": { state: "Odisha", region: "Sambalpur Region", estimate: "3–5 Business Days" },
  "78": { state: "Assam", region: "Assam & Meghalaya", estimate: "4–6 Business Days" },
  "79": { state: "North East", region: "Manipur, Nagaland, Tripura, Mizoram, Arunachal", estimate: "4–6 Business Days" },
  "80": { state: "Bihar", region: "Patna Region", estimate: "3–5 Business Days" },
  "81": { state: "Bihar", region: "Bhagalpur Region", estimate: "3–5 Business Days" },
  "82": { state: "Jharkhand", region: "Ranchi Region", estimate: "3–5 Business Days" },
  "83": { state: "Jharkhand", region: "Jamshedpur Region", estimate: "3–5 Business Days" },
  "84": { state: "Bihar", region: "Muzaffarpur Region", estimate: "3–5 Business Days" },
  "85": { state: "Bihar", region: "Purnea Region", estimate: "3–5 Business Days" },
};

function getEstimateForState(state) {
  const s = String(state || "").toLowerCase();
  if (s.includes("tamil nadu") || s.includes("puducherry")) {
    return "2–3 Business Days";
  }
  if (s.includes("kerala") || s.includes("karnataka") || s.includes("andhra") || s.includes("telangana")) {
    return "2–4 Business Days";
  }
  if (s.includes("assam") || s.includes("manipur") || s.includes("nagaland") || s.includes("tripura") || s.includes("mizoram") || s.includes("arunachal") || s.includes("meghalaya") || s.includes("kashmir") || s.includes("ladakh")) {
    return "4–6 Business Days";
  }
  return "3–5 Business Days";
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawPincode = searchParams.get("pincode") || "";

    const pincode = rawPincode.trim().replace(/\D/g, "");

    // Valid Indian postal pincodes must be exactly 6 digits starting with 1–9
    if (!/^[1-9]\d{5}$/.test(pincode)) {
      return NextResponse.json(
        {
          success: false,
          available: false,
          message: "Please enter a valid 6-digit pincode.",
        },
        { status: 400 }
      );
    }

    const prefix = pincode.substring(0, 2);
    const knownRegion = REGION_PREFIX_MAP[prefix];

    // Primary Service: Zippopotam.us Indian postal database
    try {
      const zipRes = await fetch(`https://api.zippopotam.us/in/${pincode}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(3500),
      });

      if (zipRes.ok) {
        const data = await zipRes.json();
        if (Array.isArray(data?.places) && data.places.length > 0) {
          const place = data.places[0];
          const city = place["place name"] || "";
          const state = place["state"] || "";
          const estimate = getEstimateForState(state);

          return NextResponse.json({
            success: true,
            available: true,
            pincode,
            city,
            state,
            postOffice: city,
            message: "Delivery is available to this location.",
            estimatedDelivery: estimate,
          });
        }
      } else if (zipRes.status === 404) {
        return NextResponse.json({
          success: true,
          available: false,
          pincode,
          message: "We couldn't find this pincode. Please check the number and try again.",
        });
      }
    } catch {
      // Primary service timeout or network error, proceed to secondary/fallback
    }

    // Secondary Service: PostalPincode.in API
    try {
      const postRes = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(3500),
      });

      if (postRes.ok) {
        const data = await postRes.json();
        const result = Array.isArray(data) ? data[0] : null;

        if (
          result &&
          String(result.Status || "").toLowerCase() === "success" &&
          Array.isArray(result.PostOffice) &&
          result.PostOffice.length > 0
        ) {
          const deliveryOffices = result.PostOffice.filter(
            (office) => String(office?.DeliveryStatus || "").toLowerCase() === "delivery"
          );
          const office = deliveryOffices.length > 0 ? deliveryOffices[0] : result.PostOffice[0];
          const state = office.State || "";
          const estimate = getEstimateForState(state);

          return NextResponse.json({
            success: true,
            available: true,
            pincode,
            city: office.District || office.Region || "",
            state,
            postOffice: office.Name || "",
            message: "Delivery is available to this location.",
            estimatedDelivery: estimate,
          });
        } else if (result && String(result.Status || "").toLowerCase() === "error") {
          return NextResponse.json({
            success: true,
            available: false,
            pincode,
            message: "We couldn't find this pincode. Please check the number and try again.",
          });
        }
      }
    } catch {
      // Secondary service timeout or network error, proceed to regional fallback
    }

    // Tertiary Fallback: Verified Indian Postal Regional Prefix
    if (knownRegion) {
      return NextResponse.json({
        success: true,
        available: true,
        pincode,
        city: knownRegion.region,
        state: knownRegion.state,
        postOffice: knownRegion.region,
        message: "Delivery is available to this location.",
        estimatedDelivery: knownRegion.estimate,
      });
    }

    // If prefix is outside recognized Indian postal circles
    return NextResponse.json({
      success: true,
      available: false,
      pincode,
      message: "We couldn't find this pincode. Please check the number and try again.",
    });
  } catch (error) {
    console.error("Delivery pincode check error:", error);

    return NextResponse.json(
      {
        success: false,
        available: false,
        message: "Unable to check delivery availability right now. Please try again.",
      },
      { status: 500 }
    );
  }
}