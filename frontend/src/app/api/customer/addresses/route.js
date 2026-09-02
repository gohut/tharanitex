import { AddressController } from "@/controllers/AddressController";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

export async function GET(request) {
  const { env } = await getCloudflareContext({ async: true }).catch(() => ({ env: undefined }));
  return await AddressController.getAddresses(request, env);
}

export async function POST(request) {
  const { env } = await getCloudflareContext({ async: true }).catch(() => ({ env: undefined }));
  return await AddressController.createAddress(request, env);
}

