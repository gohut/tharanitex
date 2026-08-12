import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getDB() {
  try {
    const { env } = getCloudflareContext();
    if (env?.DB) {
      return env.DB;
    }
  } catch (error) {
    // Fallback if context is unavailable
  }

  const db = process.env.DB;
  if (!db) {
    throw new Error(
      "D1 Database binding (DB) not found in process.env or getCloudflareContext()."
    );
  }
  return db;
}
