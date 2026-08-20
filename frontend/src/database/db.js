import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getDB(requestEnv) {
  if (requestEnv && requestEnv.DB) {
    return requestEnv.DB;
  }

  try {
    const ctx = await getCloudflareContext({ async: true });
    if (ctx && ctx.env && ctx.env.DB) {
      return ctx.env.DB;
    }
  } catch (error) {
    // Fallback if context is unavailable
  }

  if (typeof process !== "undefined" && process.env?.DB) {
    return process.env.DB;
  }

  return null;
}

