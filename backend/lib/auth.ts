import {
  OTP_EXPIRY_MINUTES,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_HOURS,
  UserRecord,
  SessionUserData,
} from '../types/auth';
import {
  getKV,
  findUserByPhone,
  createUser,
  updateUserLastLogin,
  saveOtpRecord,
  getLatestActiveOtp,
  incrementOtpAttempts,
  markOtpAsUsed,
  createSessionRecord,
  findSessionByToken,
  deleteSessionByToken,
  findUserById,
} from './db';
import { getSmsProvider } from './sms';

// ==================== Validation & Crypto Helpers ====================

/**
 * Validate & normalize phone numbers to exactly 10 digits
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Phone number must be a valid 10-digit mobile number.');
  }

  const trimmed = phone.trim();
  let digits = trimmed;

  if (digits.startsWith('+91')) {
    digits = digits.substring(3);
  } else if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.substring(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.substring(1);
  }

  digits = digits.replace(/[^0-9]/g, '');

  if (!/^\d{10}$/.test(digits)) {
    throw new Error('Phone number must be a valid 10-digit mobile number.');
  }

  return digits;
}

/**
 * Validate full name
 */
export function validateFullName(name: string): string {
  const trimmed = name ? name.trim() : '';
  if (!trimmed || trimmed.length < 2) {
    throw new Error('Full name must be at least 2 characters long.');
  }
  return trimmed;
}

/**
 * Generate cryptographically secure 6-digit numerical OTP
 */
export function generateNumericOtp(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const number = array[0] % 1000000;
  return number.toString().padStart(6, '0');
}

/**
 * Generate SHA-256 hash string (available for production security)
 */
export async function hashOtp(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate secure random session token
 */
export function generateSessionToken(): string {
  return `${crypto.randomUUID()}-${crypto.randomUUID()}`.replace(/-/g, '');
}

// ==================== Core Auth Services ====================

/**
 * Business Logic: Process OTP Request
 */
export async function requestOtp(fullName: string, phoneInput: string, env?: any) {
  const validName = validateFullName(fullName);
  const phoneNumber = normalizePhoneNumber(phoneInput);

  const kv = await getKV(env);
  const otp = generateNumericOtp();

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();
  const otpId = crypto.randomUUID();

  // Save plain-text OTP in Cloudflare KV for dev/testing
  // NOTE: In production, hash the OTP (e.g. hashOtp(otp)) before storing.
  await saveOtpRecord(kv, otpId, phoneNumber, otp, expiresAt);

  // Send SMS via service provider (Mock SMS logs plain-text OTP in dev terminal)
  const smsProvider = getSmsProvider(env);
  const smsResult = await smsProvider.sendOtp(phoneNumber, otp);

  if (!smsResult.success) {
    throw new Error(smsResult.error || 'Failed to send SMS OTP. Please try again.');
  }

  return {
    phoneNumber,
    expiresInMinutes: OTP_EXPIRY_MINUTES,
  };
}

/**
 * Business Logic: Verify OTP, Upsert User with Customer ID, & Create Session
 */
export async function verifyOtpAndLogin(
  fullName: string,
  phoneInput: string,
  otpInput: string,
  userAgent: string | null,
  ipAddress: string | null,
  env?: any
) {
  const validName = validateFullName(fullName);
  const phoneNumber = normalizePhoneNumber(phoneInput);
  const cleanOtp = otpInput ? otpInput.trim() : '';

  if (!cleanOtp || cleanOtp.length !== 6) {
    throw new Error('OTP must be a 6-digit code.');
  }

  const kv = await getKV(env);

  // Retrieve active OTP record from KV
  const activeOtp = await getLatestActiveOtp(kv, phoneNumber);
  if (!activeOtp) {
    throw new Error('Expired or invalid OTP. Please request a new OTP.');
  }

  // Check attempt rate limits (max 5 failed attempts)
  if (activeOtp.attempts >= 5) {
    await markOtpAsUsed(kv, activeOtp.id, phoneNumber);
    throw new Error('Too many failed OTP attempts. Please request a new OTP.');
  }

  // Verify plain-text OTP match for dev/testing
  // NOTE: For production, hash cleanOtp and compare against hashed OTP in storage.
  if (cleanOtp !== activeOtp.otpCode) {
    await incrementOtpAttempts(kv, activeOtp.id, phoneNumber);
    throw new Error('Invalid OTP code. Please check and try again.');
  }

  // Mark OTP as consumed
  await markOtpAsUsed(kv, activeOtp.id, phoneNumber);

  // Check Cloudflare KV for existing user to avoid duplicates
  let user = await findUserByPhone(kv, phoneNumber);
  if (!user) {
    const userId = crypto.randomUUID();
    user = await createUser(kv, userId, validName, phoneNumber);
  } else {
    const updatedUser = await updateUserLastLogin(kv, user.id);
    if (updatedUser) {
      user = updatedUser;
    }
  }

  // Generate session token & store in KV
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000).toISOString();
  const sessionId = crypto.randomUUID();

  const session = await createSessionRecord(
    kv,
    sessionId,
    user.id,
    sessionToken,
    expiresAt,
    userAgent,
    ipAddress
  );

  const userData: SessionUserData = {
    id: user.id,
    customerId: user.customerId,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    phoneVerified: Boolean(user.phoneVerified),
  };

  return {
    sessionToken: session.sessionToken,
    user: userData,
    expiresAt: session.expiresAt,
  };
}

/**
 * Validate session token against Cloudflare KV
 */
export async function validateSession(sessionToken: string, env?: any): Promise<SessionUserData | null> {
  if (!sessionToken) return null;

  try {
    const kv = await getKV(env);
    const session = await findSessionByToken(kv, sessionToken);
    if (!session) return null;

    const user = await findUserById(kv, session.userId);
    if (!user) return null;

    return {
      id: user.id,
      customerId: user.customerId,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      phoneVerified: Boolean(user.phoneVerified),
    };
  } catch (err) {
    return null;
  }
}

/**
 * Revoke session in Cloudflare KV
 */
export async function logoutSession(sessionToken: string, env?: any): Promise<void> {
  if (!sessionToken) return;
  try {
    const kv = await getKV(env);
    await deleteSessionByToken(kv, sessionToken);
  } catch (err) {
    // Ignore error during cleanup
  }
}

// ==================== Cookie Serializers ====================

/**
 * Construct secure HttpOnly Cookie header string
 */
export function buildSessionCookieHeader(token: string): string {
  const maxAge = SESSION_DURATION_HOURS * 60 * 60;
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

/**
 * Construct expire cookie header string for logout
 */
export function buildClearCookieHeader(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
