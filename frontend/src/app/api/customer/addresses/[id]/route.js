import { AddressController } from "@/controllers/AddressController";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

export async function GET(request, { params }) {
  const { env } = await getCloudflareContext({ async: true }).catch(() => ({ env: undefined }));
  return await AddressController.getAddressById(request, { params }, env);
}

export async function PUT(request, { params }) {
  const { env } = await getCloudflareContext({ async: true }).catch(() => ({ env: undefined }));
  return await AddressController.updateAddress(request, { params }, env);
}

export async function DELETE(request, { params }) {
  const { env } = await getCloudflareContext({ async: true }).catch(() => ({ env: undefined }));
  return await AddressController.deleteAddress(request, { params }, env);
}

