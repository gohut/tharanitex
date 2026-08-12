import { AddressController } from "@/controllers/AddressController";

export const runtime = "edge";

export async function GET(request) {
  return await AddressController.getAddresses(request);
}

export async function POST(request) {
  return await AddressController.createAddress(request);
}
