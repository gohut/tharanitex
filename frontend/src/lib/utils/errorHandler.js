/**
 * Utility to normalize API and JavaScript errors into human-friendly messages
 * Prevents exposing SQL queries, stack traces, or internal server paths.
 */
export function getFriendlyErrorMessage(
  error,
  fallback = "Something went wrong. Please check your connection and try again."
) {
  if (!error) return fallback;

  if (typeof error === "string") {
    const trimmed = error.trim();
    if (!trimmed) return fallback;
    if (isInternalErrorMessage(trimmed)) return fallback;
    return trimmed;
  }

  if (error instanceof Error) {
    const msg = error.message?.trim();
    if (msg && !isInternalErrorMessage(msg)) {
      return msg;
    }
  }

  if (typeof error === "object") {
    const candidate = error.message || error.error || error.detail || error.description;
    if (typeof candidate === "string" && candidate.trim() && !isInternalErrorMessage(candidate)) {
      return candidate.trim();
    }
  }

  return fallback;
}

function isInternalErrorMessage(message) {
  const lower = message.toLowerCase();
  const internalKeywords = [
    "sql",
    "sqlite",
    "d1_",
    "select *",
    "insert into",
    "delete from",
    "syntaxerror",
    "unexpected token <",
    "cloudflare",
    "worker.js",
    "stack trace",
    "cannot read properties of undefined",
    "internal server error",
  ];

  return internalKeywords.some((kw) => lower.includes(kw));
}
