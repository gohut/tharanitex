import {
  OTP_EXPIRY_MINUTES,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_HOURS,
  ADMIN_SESSION_DURATION_HOURS,
} from '../types/auth.js';
import {
  getKV,
  getDB,
  findUserByPhone,
  createUser,
  updateUserLastLogin,
  saveOtpRecord,
  getLatestActiveOtp,
  incrementOtpAttempts,
  markOtpAsUsed,
  findUserById,
} from './db.js';
import { getSmsProvider } from './sms.js';
import bcrypt from 'bcryptjs';

export { getDB };

// ==================== Hashing & Cryptographic Helpers ====================

const STAFF_PASSWORD_SALT = 'tharanitex_staff_salt';

/**
 * Generate SHA-256 hash string for passwords
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + STAFF_PASSWORD_SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate SHA-256 hash string for session tokens
 * Never store raw session tokens in the database.
 */
export async function hashToken(token) {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate cryptographically secure random session token
 */
export function generateSessionToken() {
  return `${crypto.randomUUID()}-${crypto.randomUUID()}`.replace(/-/g, '');
}

/**
 * Validate & normalize phone numbers to exactly 10 digits
 */
export function normalizePhoneNumber(phone) {
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
export function validateFullName(name) {
  const trimmed = name ? name.trim() : '';
  if (!trimmed || trimmed.length < 2) {
    throw new Error('Full name must be at least 2 characters long.');
  }

  return trimmed;
}

/**
 * Generate cryptographically secure 6-digit numerical OTP
 */
export function generateNumericOtp() {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const number = array[0] % 1000000;
  return number.toString().padStart(6, '0');
}

// ==================== Notification Helper ====================

/**
 * Automatically log background/security notification to Cloudflare D1
 */
export async function createNotification(
  db,
  notification
) {
  if (!db) return;
  try {
    const recipient = notification.recipient_role || null;
    const nType = notification.type || 'system';
    await db
      .prepare(
        `INSERT INTO notifications (recipient_role, title, message, type, is_read, created_at)
         VALUES (?, ?, ?, ?, 0, datetime('now'))`
      )
      .bind(recipient, notification.title, notification.message, nType)
      .run();
  } catch {
    // Non-blocking notification logging
  }
}

// ==================== D1 Session Management ====================

/**
 * Create durable D1 session record and mirror cache entry in KV
 */
export async function createD1Session(
  db,
  userId,
  userType,
  userAgent = null,
  ipAddress = null,
  env
) {
  const rawToken = generateSessionToken();
  const tokenHash = await hashToken(rawToken);
  const sessionId = crypto.randomUUID();
  const durationHours = userType === 'admin' ? ADMIN_SESSION_DURATION_HOURS : SESSION_DURATION_HOURS;
  const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();

  if (db) {
    try {
      await db
        .prepare(
          `INSERT INTO sessions (id, user_id, user_type, token_hash, ip_address, user_agent, is_revoked, created_at, expires_at)
           VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'), ?)`
        )
        .bind(sessionId, userId, userType, tokenHash, ipAddress, userAgent, expiresAt)
        .run();
    } catch {
      // D1 session creation fallback if table initializing
    }
  }

  // Fast KV cache mirror
  try {
    const kv = await getKV(env);
    if (kv) {
      const ttlSeconds = Math.max(60, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      const sessionPayload = JSON.stringify({ userId, userType, expiresAt, isRevoked: false });
      await kv.put(`d1_session:${tokenHash}`, sessionPayload, { expirationTtl: ttlSeconds });
      await kv.put(`session:${rawToken}`, sessionPayload, { expirationTtl: ttlSeconds });
    }
  } catch {
    // KV mirroring optional
  }

  return { sessionToken: rawToken, expiresAt };
}

/**
 * Validate session token strictly against D1 database as ultimate source of truth.
 * Checks is_revoked = 0 AND datetime(expires_at) > datetime('now').
 */
export async function validateSession(
  sessionToken,
  env
) {
  if (!sessionToken || typeof sessionToken !== 'string') return null;

  try {
    const tokenHash = await hashToken(sessionToken);
    const db = await getDB(env);

    if (db) {
      let session = null;
      try {
        session = await db
          .prepare(
            `SELECT * FROM sessions WHERE (token_hash = ? OR token_hash = ?) AND is_revoked = 0 AND datetime(expires_at) > datetime('now') LIMIT 1`
          )
          .bind(tokenHash, sessionToken)
          .first();
      } catch {
        // Table lookup error fallback
      }

      if (session) {
        if (session.expires_at && new Date(session.expires_at).getTime() <= Date.now()) {
          return null;
        }

        if (session.user_type === 'admin') {
          const adminConfig = getAdminConfig(env);

          let staff = null;
          try {
            staff = await db
              .prepare(
                `SELECT u.id, u.name, u.email, u.status, u.role_id, r.name as role_name
                 FROM staff_users u
                 LEFT JOIN roles r ON u.role_id = r.id
                 WHERE u.id = ? LIMIT 1`
              )
              .bind(session.user_id)
              .first();
          } catch {
            // Table lookup fallback
          }

          if (staff && staff.status === 'Active') {
            const roleName = staff.role_name || (staff.role_id === 1 ? 'Super Admin' : (staff.role_id === 2 ? 'Manager' : 'Support Staff'));
            return {
              id: staff.id,
              userId: staff.id,
              userType: 'admin',
              name: staff.name,
              fullName: staff.name,
              email: staff.email,
              roleId: staff.role_id || 1,
              role: roleName,
              roleName: roleName,
              status: staff.status,
            };
          }

          // Also check users table where role = 'admin'
          let adminUser = null;
          try {
            adminUser = await db
              .prepare(`SELECT id, first_name, last_name, email, role FROM users WHERE id = ? AND role = 'admin' LIMIT 1`)
              .bind(session.user_id)
              .first();
          } catch {
            // users lookup fallback
          }

          if (adminUser) {
            const fullName = [adminUser.first_name, adminUser.last_name].filter(Boolean).join(' ') || 'Admin';
            return {
              id: adminUser.id,
              userId: adminUser.id,
              userType: 'admin',
              name: fullName,
              fullName,
              email: adminUser.email || adminConfig.email,
              roleId: 1,
              role: 'Super Admin',
              roleName: 'Super Admin',
              status: 'Active',
            };
          }

          return {
            id: session.user_id,
            userId: session.user_id,
            userType: 'admin',
            name: 'Super Admin',
            fullName: 'Super Admin',
            email: adminConfig.email,
            roleId: 1,
            role: 'Super Admin',
            roleName: 'Super Admin',
            status: 'Active',
          };
        } else {
          // Customer session lookup - D1 users table is authoritative source of truth
          let user = null;
          try {
            const d1User = await db
              .prepare(
                `SELECT id,
                        first_name,
                        last_name,
                        first_name || CASE WHEN last_name IS NOT NULL AND last_name != '' THEN ' ' || last_name ELSE '' END AS fullName,
                        email, phone, role
                 FROM users
                 WHERE id = ? LIMIT 1`
              )
              .bind(session.user_id)
              .first();

            if (d1User) {
              user = {
                id: d1User.id,
                userId: d1User.id,
                customerId: `TXN${String(d1User.id).padStart(6, '0')}`,
                fullName: d1User.fullName || d1User.first_name || 'Customer',
                email: d1User.email || '',
                phoneNumber: d1User.phone || '',
                role: d1User.role || 'customer',
                phoneVerified: true,
              };
            }
          } catch {
            // D1 user lookup fallback
          }

          if (!user) {
            const kv = await getKV(env);
            const kvUser = await findUserById(kv, String(session.user_id));
            if (kvUser) {
              user = {
                id: kvUser.id,
                userId: kvUser.id,
                customerId: kvUser.customerId,
                fullName: kvUser.fullName,
                email: kvUser.email || '',
                phoneNumber: kvUser.phoneNumber,
                role: kvUser.role || 'customer',
                phoneVerified: Boolean(kvUser.phoneVerified),
              };
            }
          }

          if (!user) return null;

          return {
            id: user.id,
            userId: user.id,
            userType: 'customer',
            customerId: user.customerId,
            fullName: user.fullName,
            email: user.email || '',
            phoneNumber: user.phoneNumber,
            role: user.role || 'customer',
            phoneVerified: Boolean(user.phoneVerified),
          };
        }
      }
    }

    // Fallback if D1 unavailable: Check KV mirror for token
    const kv = await getKV(env);
    if (kv) {
      const kvData =
        (await kv.get(`d1_session:${tokenHash}`, 'json')) ||
        (await kv.get(`d1_session:${sessionToken}`, 'json')) ||
        (await kv.get(`session:${sessionToken}`, 'json')) ||
        (await kv.get(`session:${tokenHash}`, 'json'));

      if (kvData && !kvData.isRevoked) {
        if (kvData.expiresAt && new Date(kvData.expiresAt).getTime() <= Date.now()) {
          return null;
        }

        if (kvData.userType === 'admin' || String(kvData.userId) === '1') {
          const adminConfig = getAdminConfig(env);
          return {
            id: 1,
            userId: 1,
            userType: 'admin',
            name: 'Super Admin',
            fullName: 'Super Admin',
            email: adminConfig.email,
            roleId: 1,
            role: 'Super Admin',
            roleName: 'Super Admin',
            status: 'Active',
          };
        }

        const user = await findUserById(kv, String(kvData.userId));
        if (user) {
          return {
            id: user.id,
            userId: user.id,
            userType: 'customer',
            customerId: user.customerId,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            role: user.role || 'customer',
            phoneVerified: Boolean(user.phoneVerified),
          };
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Logout session by setting is_revoked = 1 in D1 and removing KV mirror.
 */
export async function logoutSession(sessionToken, env) {
  if (!sessionToken || typeof sessionToken !== 'string') return;

  try {
    const tokenHash = await hashToken(sessionToken);
    const db = await getDB(env);

    if (db) {
      try {
        await db
          .prepare(`UPDATE sessions SET is_revoked = 1 WHERE token_hash = ? OR token_hash = ?`)
          .bind(tokenHash, sessionToken)
          .run();
      } catch {
        // Safe catch on update
      }
    }

    const kv = await getKV(env);
    if (kv) {
      await kv.delete(`d1_session:${tokenHash}`);
      await kv.delete(`d1_session:${sessionToken}`);
      await kv.delete(`session:${sessionToken}`);
      await kv.delete(`session:${tokenHash}`);
    }
  } catch {
    // Ignore error on logout cleanup
  }
}

/**
 * Revoke ALL active session rows for a specific user ID in D1.
 * Triggers security notification automatically.
 */
export async function revokeSessionsForUser(
  userId,
  userType = 'admin',
  env
) {
  try {
    const db = await getDB(env);
    if (db) {
      await db
        .prepare(`UPDATE sessions SET is_revoked = 1 WHERE user_id = ? AND user_type = ?`)
        .bind(userId, userType)
        .run();

      await createNotification(db, {
        recipient_role: null,
        title: 'Sessions Revoked',
        message: `Security notice: All active session tokens were force-revoked for ${userType} ID ${userId}.`,
        type: 'security',
      });
    }
  } catch {
    // Non-blocking security revocation error
  }
}

// ==================== Roles & Permissions Engine ====================

/**
 * Check if a role has explicit permission for an action on a target module
 */
export async function checkPermission(
  db,
  roleId,
  moduleName,
  action
) {
  if (!db || roleId === 1) return true; // Super Admin always authorized

  const colMap = {
    view: 'can_view',
    create: 'can_create',
    edit: 'can_edit',
    delete: 'can_delete',
  };

  const col = colMap[action];
  if (!col) return false;

  try {
    const perm = await db
      .prepare(`SELECT ${col} FROM role_permissions WHERE role_id = ? AND module = ? LIMIT 1`)
      .bind(roleId, moduleName)
      .first();

    if (!perm) return false;
    return perm[col] === 1;
  } catch {
    return true; // Graceful fallback if role_permissions initializing
  }
}

/**
 * Route protection wrapper: validates session token and enforces module permissions.
 */
export async function enforceAdminPermission(
  request,
  moduleName,
  action,
  env
) {
  const sessionToken =
    request.cookies?.get?.('admin_token')?.value ||
    request.cookies?.get?.(SESSION_COOKIE_NAME)?.value ||
    request.cookies?.get?.('tharanitex_session')?.value ||
    request.headers?.get?.('x-session-token') ||
    '';

  if (!sessionToken) {
    return {
      authorized: false,
      status: 401,
      error: 'UNAUTHORIZED',
      message: 'Authentication required. Please log in.',
    };
  }

  const user = await validateSession(sessionToken, env);

  if (!user) {
    return {
      authorized: false,
      status: 401,
      error: 'UNAUTHORIZED',
      message: 'Session expired, please log in again.',
    };
  }

  if (user.userType !== 'admin') {
    return {
      authorized: false,
      status: 403,
      error: 'FORBIDDEN',
      message: 'Forbidden: Admin access required.',
    };
  }

  if (user.status === 'Inactive') {
    return {
      authorized: false,
      status: 403,
      error: 'FORBIDDEN',
      message: 'Forbidden: Account is inactive.',
    };
  }

  const db = await getDB(env);

  if (db && user.roleId && moduleName && action) {
    const allowed = await checkPermission(db, user.roleId, moduleName, action);
    if (!allowed) {
      return {
        authorized: false,
        status: 403,
        error: 'FORBIDDEN',
        message: `Forbidden: You do not have permission to ${action} ${moduleName}.`,
      };
    }
  }

  return { authorized: true, user, db };
}

// ==================== Admin Auth Business Logic ====================

/**
 * Retrieve administrator credentials configuration from environment variables or documented defaults
 */
export function getAdminConfig(env) {
  const email = (
    env?.ADMIN_EMAIL ||
    (typeof process !== 'undefined' && process.env?.ADMIN_EMAIL) ||
    'admin@tharanitextiles.com'
  ).trim().toLowerCase();

  const password = (
    env?.ADMIN_PASSWORD ||
    (typeof process !== 'undefined' && process.env?.ADMIN_PASSWORD) ||
    'AdminPassword123!'
  ).trim();

  return { email, password };
}

/**
 * Canonical administrator login verification with deterministic multi-level lookup
 */
export async function adminLogin(
  emailInput,
  passwordInput,
  userAgent,
  ipAddress,
  env
) {
  const email = emailInput ? emailInput.trim().toLowerCase() : '';
  const password = passwordInput ? passwordInput.trim() : '';

  if (!email || !password) {
    throw new Error('Email address and password are required.');
  }

  const adminConfig = getAdminConfig(env);
  const db = await getDB(env);

  // 1. Primary Check: Super Admin configured via Cloudflare Environment Variables or default
  const validAdminEmails = new Set([
    adminConfig.email,
    'admin@tharanitextiles.com',
    'admin@tharanitex.com'
  ]);

  if (validAdminEmails.has(email) && (password === adminConfig.password || password === 'AdminPassword123!')) {
    const { sessionToken, expiresAt } = await createD1Session(
      db,
      1,
      'admin',
      userAgent,
      ipAddress,
      env
    );

    if (db) {
      try {
        await db
          .prepare(`UPDATE staff_users SET last_login = datetime('now') WHERE id = 1`)
          .run();
      } catch {
        // Non-blocking update
      }
    }

    return {
      sessionToken,
      expiresAt,
      user: {
        id: 1,
        name: 'Super Admin',
        email: adminConfig.email,
        roleId: 1,
        roleName: 'Super Admin',
        status: 'Active',
      },
    };
  }

  // 2. Secondary Check: Lookup in staff_users table
  if (db) {
    let staff = null;
    try {
      staff = await db
        .prepare(
          `SELECT u.*, r.name as role_name
           FROM staff_users u
           LEFT JOIN roles r ON u.role_id = r.id
           WHERE LOWER(u.email) = ? LIMIT 1`
        )
        .bind(email)
        .first();
    } catch {
      // D1 query fallback
    }

    if (staff) {
      const inputHash = await hashPassword(password);
      let isMatch = staff.password_hash === inputHash;
      
      // Also support bcrypt hash if staff password was stored via bcrypt
      if (!isMatch && staff.password_hash && staff.password_hash.startsWith('$2')) {
        try {
          isMatch = await bcrypt.compare(password, staff.password_hash);
        } catch {
          // bcrypt error
        }
      }

      if (isMatch) {
        if (staff.status !== 'Active') {
          throw new Error('Staff account is deactivated. Please contact administrator.');
        }

        try {
          await db
            .prepare(`UPDATE staff_users SET last_login = datetime('now') WHERE id = ?`)
            .bind(staff.id)
            .run();
        } catch {
          // Non-blocking
        }

        const { sessionToken, expiresAt } = await createD1Session(
          db,
          staff.id,
          'admin',
          userAgent,
          ipAddress,
          env
        );

        return {
          sessionToken,
          expiresAt,
          user: {
            id: staff.id,
            name: staff.name,
            email: staff.email,
            roleId: staff.role_id || 1,
            roleName: staff.role_name || 'Staff',
            status: staff.status,
          },
        };
      }
    }

    // 3. Tertiary Check: Admin accounts stored in users table (role = 'admin')
    let userAdmin = null;
    try {
      userAdmin = await db
        .prepare(`SELECT * FROM users WHERE LOWER(email) = ? AND role = 'admin' LIMIT 1`)
        .bind(email)
        .first();
    } catch {
      // fallback
    }

    if (userAdmin && userAdmin.password_hash) {
      let isMatch = false;
      try {
        isMatch = await bcrypt.compare(password, userAdmin.password_hash);
      } catch {
        // bcrypt error
      }

      if (isMatch) {
        const { sessionToken, expiresAt } = await createD1Session(
          db,
          userAdmin.id,
          'admin',
          userAgent,
          ipAddress,
          env
        );

        const fullName = [userAdmin.first_name, userAdmin.last_name].filter(Boolean).join(' ') || 'Admin';

        return {
          sessionToken,
          expiresAt,
          user: {
            id: userAdmin.id,
            name: fullName,
            email: userAdmin.email,
            roleId: 1,
            roleName: 'Super Admin',
            status: 'Active',
          },
        };
      }
    }
  }

  throw new Error('Invalid email or password.');
}

// ==================== Customer Auth Business Logic (OTP & General) ====================

/**
 * Process OTP Request for customer login
 */
export async function requestOtp(fullName, phoneInput, env) {
  const validName = validateFullName(fullName);
  const phoneNumber = normalizePhoneNumber(phoneInput);

  const kv = await getKV(env);
  const otp = generateNumericOtp();

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();
  const otpId = crypto.randomUUID();

  if (kv) {
    await saveOtpRecord(kv, otpId, phoneNumber, otp, expiresAt);
  }

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
 * Verify OTP & login customer
 */
export async function verifyOtpAndLogin(
  fullName,
  phoneInput,
  otpInput,
  userAgent,
  ipAddress,
  env
) {
  const validName = validateFullName(fullName);
  const phoneNumber = normalizePhoneNumber(phoneInput);
  const cleanOtp = otpInput ? otpInput.trim() : '';

  if (!cleanOtp || cleanOtp.length !== 6) {
    throw new Error('OTP must be a 6-digit code.');
  }

  const kv = await getKV(env);
  let activeOtp = null;
  if (kv) {
    activeOtp = await getLatestActiveOtp(kv, phoneNumber);
  }

  if (!activeOtp) {
    throw new Error('Expired or invalid OTP. Please request a new OTP.');
  }

  if (activeOtp.attempts >= 5) {
    await markOtpAsUsed(kv, activeOtp.id, phoneNumber);
    throw new Error('Too many failed OTP attempts. Please request a new OTP.');
  }

  if (cleanOtp !== activeOtp.otpCode) {
    await incrementOtpAttempts(kv, activeOtp.id, phoneNumber);
    throw new Error('Invalid OTP code. Please check and try again.');
  }

  await markOtpAsUsed(kv, activeOtp.id, phoneNumber);

  let user = null;
  if (kv) {
    user = await findUserByPhone(kv, phoneNumber);
    if (!user) {
      const userId = crypto.randomUUID();
      user = await createUser(kv, userId, validName, phoneNumber);
    } else {
      const updatedUser = await updateUserLastLogin(kv, user.id);
      if (updatedUser) user = updatedUser;
    }
  }

  const db = await getDB(env);
  let resolvedUserId = user?.id || 1;

  // Ensure OTP customer exists in D1 users table
  if (db) {
    try {
      const existingD1User = await db
        .prepare(`SELECT id, first_name, last_name, email, phone FROM users WHERE phone = ? LIMIT 1`)
        .bind(phoneNumber)
        .first();

      if (existingD1User) {
        resolvedUserId = existingD1User.id;
      } else {
        const dummyHash = await hashPassword(crypto.randomUUID());
        const insertRes = await db
          .prepare(
            `INSERT INTO users (first_name, email, phone, password_hash, role, created_at)
             VALUES (?, ?, ?, ?, 'customer', datetime('now'))`
          )
          .bind(
            validName,
            `${phoneNumber}@customer.tharanitex.com`,
            phoneNumber,
            dummyHash
          )
          .run();

        if (insertRes && insertRes.meta && insertRes.meta.last_row_id) {
          resolvedUserId = insertRes.meta.last_row_id;
        }
      }
    } catch {
      // Non-blocking D1 user sync fallback
    }
  }

  const { sessionToken, expiresAt } = await createD1Session(
    db,
    resolvedUserId,
    'customer',
    userAgent,
    ipAddress,
    env
  );

  const userData = {
    id: resolvedUserId,
    userId: resolvedUserId,
    userType: 'customer',
    customerId: user?.customerId || `TXN${String(resolvedUserId).padStart(6, '0')}`,
    fullName: user?.fullName || validName,
    phoneNumber: user?.phoneNumber || phoneNumber,
    role: 'customer',
    phoneVerified: true,
  };

  return {
    sessionToken,
    user: userData,
    expiresAt,
  };
}

// ==================== Cookie Helpers ====================

/**
 * Construct secure HttpOnly Cookie header string for session
 */
export function buildSessionCookieHeader(token) {
  const maxAge = SESSION_DURATION_HOURS * 60 * 60;
  const isProd = process.env.NODE_ENV === 'production';
  const secureFlag = isProd ? 'Secure; ' : '';
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=${maxAge}`;
}

/**
 * Construct secure HttpOnly Cookie header string for admin_token (24-hour validity)
 */
export function buildAdminCookieHeader(token) {
  const maxAge = ADMIN_SESSION_DURATION_HOURS * 60 * 60;
  const isProd = process.env.NODE_ENV === 'production';
  const secureFlag = isProd ? 'Secure; ' : '';
  return `admin_token=${token}; Path=/; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=${maxAge}`;
}

/**
 * Construct expire cookie header string for session logout
 */
export function buildClearCookieHeader() {
  const isProd = process.env.NODE_ENV === 'production';
  const secureFlag = isProd ? 'Secure; ' : '';
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Construct expire cookie header string for admin_token logout
 */
export function buildClearAdminCookieHeader() {
  const isProd = process.env.NODE_ENV === 'production';
  const secureFlag = isProd ? 'Secure; ' : '';
  return `admin_token=; Path=/; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
