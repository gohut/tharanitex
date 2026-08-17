/** Resolve the JWT secret from the active Next/OpenNext runtime. */
export function getJwtSecret(env) {
  const secret = env?.JWT_SECRET || process.env.JWT_SECRET;
  if (secret) return secret;
  // Preserve the existing local-development behavior; production requires a
  // configured Cloudflare JWT_SECRET rather than a silently different key.
  if (process.env.NODE_ENV !== "production") return "tharanitex_super_secret_key_123!";
  throw new Error("JWT_SECRET is not configured.");
}
