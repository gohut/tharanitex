import { AddressController } from "@/controllers/AddressController";

export const runtime = "edge";

export async function GET(request, { params }) {
  return await AddressController.getAddressById(request, { params });
}

export async function PUT(request, { params }) {
  return await AddressController.updateAddress(request, { params });
}

export async function DELETE(request, { params }) {
  return await AddressController.deleteAddress(request, { params });
}
