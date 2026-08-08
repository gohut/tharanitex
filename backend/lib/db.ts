import { CloudflareEnv, UserRecord, OtpVerificationRecord, UserSessionRecord } from '../types/auth';

/**
 * In-Memory Mock KV Namespace for local next dev environment
 */
class MockKVNamespace {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string, type?: string): Promise<any> {
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

  async put(
    key: string,
    value: string | number,
    options?: { expiration?: number; expirationTtl?: number }
  ): Promise<void> {
    let expiresAt: number | undefined;
    if (options?.expiration) {
      expiresAt = options.expiration * 1000;
    } else if (options?.expirationTtl) {
      expiresAt = Date.now() + options.expirationTtl * 1000;
    }
    this.store.set(key, { value: String(value), expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async list(options?: { prefix?: string }): Promise<any> {
    const prefix = options?.prefix || '';
    const keys: { name: string }[] = [];
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
if (!(globalThis as any)[globalMockKvSymbol]) {
  (globalThis as any)[globalMockKvSymbol] = new MockKVNamespace();
}

/**
 * Retrieve Cloudflare KV binding or dev fallback
 */
export async function getKV(requestEnv?: CloudflareEnv): Promise<KVNamespace> {
  if (requestEnv && requestEnv.KV) {
    return requestEnv.KV;
  }

  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const ctx = await getCloudflareContext();
    if (ctx && ctx.env && (ctx.env as CloudflareEnv).KV) {
      return (ctx.env as CloudflareEnv).KV;
    }
  } catch (e) {
    // OpenNext context unavailable (e.g. static build time or dev fallback)
  }

  // Fallback to in-memory Mock KV Namespace for local next dev testing
  return (globalThis as any)[globalMockKvSymbol] as unknown as KVNamespace;
}

/**
 * Retrieve Cloudflare D1 Database binding (env.DB)
 */
export async function getDB(requestEnv?: CloudflareEnv): Promise<D1Database | null> {
  if (requestEnv && requestEnv.DB) {
    return requestEnv.DB;
  }

  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const ctx = await getCloudflareContext();
    if (ctx && ctx.env && (ctx.env as CloudflareEnv).DB) {
      return (ctx.env as CloudflareEnv).DB || null;
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
export async function getNextCustomerId(kv: KVNamespace): Promise<string> {
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

export async function findUserByPhone(kv: KVNamespace, phoneNumber: string): Promise<UserRecord | null> {
  const key = `user:phone:${phoneNumber}`;
  const user = await kv.get<UserRecord>(key, 'json');
  return user || null;
}

export async function findUserById(kv: KVNamespace, userId: string): Promise<UserRecord | null> {
  const key = `user:id:${userId}`;
  const user = await kv.get<UserRecord>(key, 'json');
  return user || null;
}

export async function createUser(
  kv: KVNamespace,
  id: string,
  fullName: string,
  phoneNumber: string
): Promise<UserRecord> {
  const customerId = await getNextCustomerId(kv);
  const now = new Date().toISOString();
  const newUser: UserRecord = {
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

export async function updateUserLastLogin(kv: KVNamespace, userId: string): Promise<UserRecord | null> {
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

/**
 * Save OTP record to KV in plain text for development & testing.
 * NOTE: Storing plain-text OTP is intended only for dev/testing environments.
 * For production environments, hash the OTP (e.g. SHA-256) before storing in KV for security.
 */
export async function saveOtpRecord(
  kv: KVNamespace,
  id: string,
  phoneNumber: string,
  otpCode: string,
  expiresAtIso: string
): Promise<void> {
  const now = new Date().toISOString();
  const otpRecord: OtpVerificationRecord = {
    id,
    phoneNumber,
    otpCode, // Plain text stored for dev/testing
    expiresAt: expiresAtIso,
    isUsed: false,
    attempts: 0,
    createdAt: now,
  };

  const ttlSeconds = Math.max(60, Math.floor((new Date(expiresAtIso).getTime() - Date.now()) / 1000));
  await kv.put(`otp:${phoneNumber}`, JSON.stringify(otpRecord), { expirationTtl: ttlSeconds });
}

export async function getLatestActiveOtp(
  kv: KVNamespace,
  phoneNumber: string
): Promise<OtpVerificationRecord | null> {
  const key = `otp:${phoneNumber}`;
  const otp = await kv.get<OtpVerificationRecord>(key, 'json');

  if (!otp) return null;
  if (otp.isUsed) return null;
  if (new Date(otp.expiresAt).getTime() <= Date.now()) return null;

  return otp;
}

export async function incrementOtpAttempts(
  kv: KVNamespace,
  otpId: string,
  phoneNumber: string
): Promise<void> {
  const key = `otp:${phoneNumber}`;
  const otp = await kv.get<OtpVerificationRecord>(key, 'json');

  if (otp) {
    otp.attempts += 1;
    const ttlSeconds = Math.max(60, Math.floor((new Date(otp.expiresAt).getTime() - Date.now()) / 1000));
    await kv.put(key, JSON.stringify(otp), { expirationTtl: ttlSeconds });
  }
}

export async function markOtpAsUsed(
  kv: KVNamespace,
  otpId: string,
  phoneNumber: string
): Promise<void> {
  await kv.delete(`otp:${phoneNumber}`);
}

// ==================== Session KV Operations ====================

export async function createSessionRecord(
  kv: KVNamespace,
  id: string,
  userId: string,
  sessionToken: string,
  expiresAtIso: string,
  userAgent: string | null,
  ipAddress: string | null
): Promise<UserSessionRecord> {
  const now = new Date().toISOString();
  const session: UserSessionRecord = {
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

export async function findSessionByToken(
  kv: KVNamespace,
  sessionToken: string
): Promise<UserSessionRecord | null> {
  const key = `session:${sessionToken}`;
  const session = await kv.get<UserSessionRecord>(key, 'json');

  if (!session) return null;
  if (new Date(session.expiresAt).getTime() <= Date.now()) return null;

  return session;
}

export async function deleteSessionByToken(kv: KVNamespace, sessionToken: string): Promise<void> {
  await kv.delete(`session:${sessionToken}`);
}

export async function deleteUserSessions(kv: KVNamespace, userId: string): Promise<void> {
  // Utility for clearing user sessions if needed
}
