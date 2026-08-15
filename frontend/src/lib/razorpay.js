const RAZORPAY_API = "https://api.razorpay.com/v1";

function config(env) {
  const keyId = env?.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const keySecret = env?.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Online payments are not configured.");
  return { keyId, keySecret };
}

export function getRazorpayKeyId(env) {
  return config(env).keyId;
}

function authHeader(keyId, keySecret) {
  return `Basic ${btoa(`${keyId}:${keySecret}`)}`;
}

async function request(env, path, options = {}) {
  const { keyId, keySecret } = config(env);
  const response = await fetch(`${RAZORPAY_API}${path}`, {
    ...options,
    headers: { Authorization: authHeader(keyId, keySecret), ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("Razorpay API error", { path, status: response.status, code: data?.error?.code });
    throw new Error("Unable to initialize online payment.");
  }
  return data;
}

export async function createRazorpayOrder(env, { amount, receipt }) {
  const { keyId } = config(env);
  const order = await request(env, "/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, currency: "INR", receipt, payment_capture: 1 }),
  });
  return { id: order.id, keyId };
}

export async function getRazorpayPayment(env, paymentId) {
  return request(env, `/payments/${encodeURIComponent(paymentId)}`);
}

export async function verifyRazorpaySignature(env, orderId, paymentId, signature) {
  const { keySecret } = config(env);
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(keySecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${orderId}|${paymentId}`));
  const expected = Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return mismatch === 0;
}
