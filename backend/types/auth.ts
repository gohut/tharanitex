// Cloudflare KV Database, D1 Database, and Worker Environment Bindings
export interface CloudflareEnv {
  KV: KVNamespace;
  DB?: D1Database;
  IMAGES?: R2Bucket;
  SMS_PROVIDER?: 'twilio' | 'msg91' | 'textlocal' | 'mock';
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_FROM_PHONE?: string;
  MSG91_AUTH_KEY?: string;
  MSG91_TEMPLATE_ID?: string;
  TEXTLOCAL_API_KEY?: string;
  TEXTLOCAL_SENDER?: string;
  COOKIE_SECRET?: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
}

// ==================== D1 Database Entities ====================

export interface Role {
  id: number;
  name: string; // 'Super Admin' | 'Manager' | 'Support Staff'
  created_at?: string;
}

export interface StaffUser {
  id: number;
  name: string;
  email: string;
  password_hash?: string;
  role_id: number;
  role_name?: string;
  status: 'Active' | 'Inactive';
  last_login?: string | null;
  created_at?: string;
}

export interface RolePermission {
  id: number;
  role_id: number;
  module: ModuleName;
  can_view: number;   // 0 or 1
  can_create: number; // 0 or 1
  can_edit: number;   // 0 or 1
  can_delete: number; // 0 or 1
}

export interface D1SessionRecord {
  id: string;          // uuid
  user_id: number;
  user_type: 'admin' | 'customer';
  token_hash: string;
  ip_address: string | null;
  user_agent: string | null;
  is_revoked: number;  // 0 or 1
  created_at: string;
  expires_at: string;
}

export interface NotificationRecord {
  id: number;
  recipient_role: string | null; // null = all roles
  title: string;
  message: string;
  type: 'order' | 'system' | 'security' | 'user' | 'review';
  is_read: number;               // 0 or 1
  created_at: string;
}

export type ModuleName =
  | 'Products'
  | 'Orders'
  | 'Customers'
  | 'Shipping'
  | 'Reviews'
  | 'CMS'
  | 'Users & Roles'
  | 'Settings';

export interface ModulePermissionInput {
  module: ModuleName;
  can_view: boolean | number;
  can_create: boolean | number;
  can_edit: boolean | number;
  can_delete: boolean | number;
}

// User Record in Cloudflare KV (Legacy / Customer)
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

// OTP Verification Record
export interface OtpVerificationRecord {
  id: string;
  phoneNumber: string;
  otpCode: string;
  expiresAt: string;
  isUsed: boolean;
  attempts: number;
  createdAt: string;
}

// User Session Record
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

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface CreateStaffRequest {
  name: string;
  email: string;
  password: string;
  role_id: number;
  status?: 'Active' | 'Inactive';
}

export interface UpdateStaffRequest {
  name?: string;
  email?: string;
  password?: string;
  role_id?: number;
  status?: 'Active' | 'Inactive';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface SessionUserData {
  id: number | string;
  userId: number | string;
  userType: 'admin' | 'customer';
  name?: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  customerId?: string;
  roleId?: number;
  role: string;
  roleName?: string;
  status?: string;
  phoneVerified?: boolean;
}

export const SESSION_COOKIE_NAME = 'tharanitex_session';
export const SESSION_DURATION_HOURS = 24 * 7; // 7 Days session
export const OTP_EXPIRY_MINUTES = 5; // 5 Minutes OTP validity
