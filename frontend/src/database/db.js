import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Retrieve Cloudflare D1 Database binding safely in both async and sync contexts.
 */
export function getDB(envOrDb) {
  if (envOrDb?.prepare) {
    return envOrDb;
  }
  if (envOrDb?.DB?.prepare) {
    return envOrDb.DB;
  }

  // Check global environment cache populated by route handlers
  if (globalThis.__CF_ENV__?.DB?.prepare) {
    return globalThis.__CF_ENV__.DB;
  }

  try {
    const ctx = getCloudflareContext();
    if (ctx?.env?.DB?.prepare) {
      return ctx.env.DB;
    }
  } catch {
    // getCloudflareContext is not available synchronously in all worker phases
  }

  if (typeof process !== "undefined" && process.env?.DB?.prepare) {
    return process.env.DB;
  }

  return null;
}
