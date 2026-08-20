/**
 * In-Memory Mock KV Namespace for local next dev environment
 */
class MockKVNamespace {
  constructor() {
    this.store = new Map();
  }

  async get(key, type) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    if (type === 'json') {
      try {
        return JSON.parse(entry.value);
      } catch {
        return null;
      }
    }
    return entry.value;
  }

  async put(key, value, options) {
    let expiresAt;
    if (options?.expiration) {
      expiresAt = options.expiration * 1000;
    } else if (options?.expirationTtl) {
      expiresAt = Date.now() + options.expirationTtl * 1000;
    }
    this.store.set(key, { value: String(value), expiresAt });
  }

  async delete(key) {
    this.store.delete(key);
  }

  async list(options) {
    const prefix = options?.prefix || '';
    const keys = [];
    const now = Date.now();
    for (const [k, v] of this.store.entries()) {
      if (v.expiresAt && now > v.expiresAt) {
        this.store.delete(k);
        continue;
      }
      if (k.startsWith(prefix)) {
        keys.push({ name: k });
      }
    }
    return { keys, list_complete: true };
  }
}

// Global reference for dev fallback
const globalMockKvSymbol = Symbol.for('tharanitex_mock_kv_namespace');
if (!globalThis[globalMockKvSymbol]) {
  globalThis[globalMockKvSymbol] = new MockKVNamespace();
}

/**
 * Retrieve Cloudflare KV binding or dev fallback
 */
export async function getKV(requestEnv) {
  if (requestEnv && requestEnv.KV) {
    return requestEnv.KV;
  }

  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const ctx = await getCloudflareContext();
    if (ctx && ctx.env && ctx.env.KV) {
      return ctx.env.KV;
    }
  } catch (e) {
    // OpenNext context unavailable (e.g. static build time or dev fallback)
  }

  // Fallback to in-memory Mock KV Namespace for local next dev testing
  return globalThis[globalMockKvSymbol];
}

/**
 * Retrieve Cloudflare D1 Database binding (env.DB)
 */
export async function getDB(requestEnv) {
  if (requestEnv && requestEnv.DB) {
    return requestEnv.DB;
  }

  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const ctx = await getCloudflareContext();
    if (ctx && ctx.env && ctx.env.DB) {
      return ctx.env.DB || null;
    }
  } catch (e) {
    // OpenNext context unavailable
  }

  return null;
}

// ==================== Ecommerce Customer Counter ====================

/**
 * Generate sequential customer ID (e.g., TXN000001, TXN000002) using customer_counter in KV
 */
export async function getNextCustomerId(kv) {
  const counterKey = 'customer_counter';
  let currentCount = 0;
  const val = await kv.get(counterKey);
  if (val) {
    currentCount = parseInt(val, 10) || 0;
  }
  const nextCount = currentCount + 1;
  await kv.put(counterKey, nextCount.toString());
  const padded = nextCount.toString().padStart(6, '0');
  return `TXN${padded}`;
}

// ==================== User KV Operations ====================

export async function findUserByPhone(kv, phoneNumber) {
  const key = `user:phone:${phoneNumber}`;
  const user = await kv.get(key, 'json');
  return user || null;
}

export async function findUserById(kv, userId) {
  const key = `user:id:${userId}`;
  const user = await kv.get(key, 'json');
  return user || null;
}

export async function createUser(kv, id, fullName, phoneNumber) {
  const customerId = await getNextCustomerId(kv);
  const now = new Date().toISOString();
  const newUser = {
    id,
    customerId,
    fullName,
    phoneNumber,
    phoneVerified: true,
    role: 'customer',
    lastLogin: now,
    createdAt: now,
    updatedAt: now,
  };

  const json = JSON.stringify(newUser);
  await kv.put(`user:id:${id}`, json);
  await kv.put(`user:phone:${phoneNumber}`, json);

  return newUser;
}

export async function updateUserLastLogin(kv, userId) {
  const user = await findUserById(kv, userId);
  if (user) {
    const now = new Date().toISOString();
    user.phoneVerified = true;
    user.lastLogin = now;
    user.updatedAt = now;

    const json = JSON.stringify(user);
    await kv.put(`user:id:${user.id}`, json);
    await kv.put(`user:phone:${user.phoneNumber}`, json);
    return user;
  }
  return null;
}

// ==================== OTP KV Operations ====================

export async function saveOtpRecord(kv, id, phoneNumber, otpCode, expiresAtIso) {
  const now = new Date().toISOString();
  const otpRecord = {
    id,
    phoneNumber,
    otpCode,
    expiresAt: expiresAtIso,
    isUsed: false,
    attempts: 0,
    createdAt: now,
  };

  const ttlSeconds = Math.max(60, Math.floor((new Date(expiresAtIso).getTime() - Date.now()) / 1000));
  await kv.put(`otp:${phoneNumber}`, JSON.stringify(otpRecord), { expirationTtl: ttlSeconds });
}

export async function getLatestActiveOtp(kv, phoneNumber) {
  const key = `otp:${phoneNumber}`;
  const otp = await kv.get(key, 'json');

  if (!otp) return null;
  if (otp.isUsed) return null;
  if (new Date(otp.expiresAt).getTime() <= Date.now()) return null;

  return otp;
}

export async function incrementOtpAttempts(kv, otpId, phoneNumber) {
  const key = `otp:${phoneNumber}`;
  const otp = await kv.get(key, 'json');

  if (otp) {
    otp.attempts += 1;
    const ttlSeconds = Math.max(60, Math.floor((new Date(otp.expiresAt).getTime() - Date.now()) / 1000));
    await kv.put(key, JSON.stringify(otp), { expirationTtl: ttlSeconds });
  }
}

export async function markOtpAsUsed(kv, otpId, phoneNumber) {
  await kv.delete(`otp:${phoneNumber}`);
}

// ==================== Session KV Operations ====================

export async function createSessionRecord(
  kv,
  id,
  userId,
  sessionToken,
  expiresAtIso,
  userAgent,
  ipAddress
) {
  const now = new Date().toISOString();
  const session = {
    id,
    userId,
    sessionToken,
    expiresAt: expiresAtIso,
    userAgent,
    ipAddress,
    createdAt: now,
    updatedAt: now,
  };

  const ttlSeconds = Math.max(60, Math.floor((new Date(expiresAtIso).getTime() - Date.now()) / 1000));
  await kv.put(`session:${sessionToken}`, JSON.stringify(session), { expirationTtl: ttlSeconds });

  return session;
}

export async function findSessionByToken(kv, sessionToken) {
  const key = `session:${sessionToken}`;
  const session = await kv.get(key, 'json');

  if (!session) return null;
  if (new Date(session.expiresAt).getTime() <= Date.now()) return null;

  return session;
}

export async function deleteSessionByToken(kv, sessionToken) {
  await kv.delete(`session:${sessionToken}`);
}

export async function deleteUserSessions(kv, userId) {
  // Utility for clearing user sessions if needed
}
