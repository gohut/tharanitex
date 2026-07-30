// Cloudflare KV Database and Worker Environment Bindings
export interface CloudflareEnv {
  KV: KVNamespace;
  SMS_PROVIDER?: 'twilio' | 'msg91' | 'textlocal' | 'mock';
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_FROM_PHONE?: string;
  MSG91_AUTH_KEY?: string;
  MSG91_TEMPLATE_ID?: string;
  TEXTLOCAL_API_KEY?: string;
  TEXTLOCAL_SENDER?: string;
  COOKIE_SECRET?: string;
}

// User Record in Cloudflare KV
export interface UserRecord {
  id: string;
  customerId: string; // e.g. TXN000001
  fullName: string;
  phoneNumber: string; // 10-digit mobile number e.g. 9876543210
  phoneVerified: boolean;
  role: 'customer' | 'admin';
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

// OTP Verification Record in Cloudflare KV
// NOTE: Plain-text OTP stored for dev/testing. For production security, hash the OTP (e.g., using SHA-256) before storing.
export interface OtpVerificationRecord {
  id: string;
  phoneNumber: string; // 10-digit mobile number
  otpCode: string; // Plain text OTP for dev/testing
  expiresAt: string;
  isUsed: boolean;
  attempts: number;
  createdAt: string;
}

// User Session Record in Cloudflare KV
export interface UserSessionRecord {
  id: string;
  userId: string;
  sessionToken: string;
  expiresAt: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  updatedAt: string;
}

// API DTOs
export interface SendOtpRequest {
  fullName: string;
  phoneNumber: string;
}

export interface VerifyOtpRequest {
  fullName: string;
  phoneNumber: string;
  otp: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface SessionUserData {
  id: string;
  customerId: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  phoneVerified: boolean;
}

export const SESSION_COOKIE_NAME = 'tharanitex_session';
export const SESSION_DURATION_HOURS = 24 * 7; // 7 Days session
export const OTP_EXPIRY_MINUTES = 5; // 5 Minutes OTP validity
