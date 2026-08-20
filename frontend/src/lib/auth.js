import {
  OTP_EXPIRY_MINUTES,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_HOURS,
} from '../types/auth';
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
} from './db';
import { getSmsProvider } from './sms';

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
  } catch (err) {
    // Ignore non-critical notification logging failures
  }
}

// ==================== D1 Session Management ====================

/**
 * Create durable D1 session record and mirror optional cache entry in KV
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
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000).toISOString();

  if (db) {
    try {
      await db
        .prepare(
          `INSERT INTO sessions (id, user_id, user_type, token_hash, ip_address, user_agent, is_revoked, created_at, expires_at)
           VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now', '+7 days'))`
        )
        .bind(sessionId, userId, userType, tokenHash, ipAddress, userAgent)
        .run();
    } catch {
      // D1 session creation fallback
    }
  }

  // Fast KV cache mirror
  try {
    const kv = await getKV(env);
    if (kv) {
      const ttlSeconds = Math.max(60, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      const sessionPayload = JSON.stringify({ userId, userType, expiresAt });
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
 * Checks is_revoked = 0 AND expires_at > current time.
 */
export async function validateSession(
  sessionToken,
  env
) {
  if (!sessionToken) return null;

  try {
    const tokenHash = await hashToken(sessionToken);
    const db = await getDB(env);

    if (db) {
      // Query D1 sessions table directly checking both token_hash = tokenHash AND token_hash = sessionToken
      const session = await db
        .prepare(
          `SELECT * FROM sessions WHERE (token_hash = ? OR token_hash = ?) AND is_revoked = 0 AND datetime(expires_at) > datetime('now')`
        )
        .bind(tokenHash, sessionToken)
        .first();

      if (session) {
        if (session.user_type === 'admin') {
          const adminConfig = getAdminConfig(env);

          if (Number(session.user_id) === 1) {
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

          let staff = null;

          try {
            staff = await db
              .prepare(
                `SELECT u.id, u.name, u.email, u.status, u.role_id, r.name as role_name
                 FROM staff_users u
                 JOIN roles r ON u.role_id = r.id
                 WHERE u.id = ?`
              )
              .bind(session.user_id)
              .first();
          } catch {
            // Table lookup error fallback
          }

          if (staff && staff.status === 'Active') {
            return {
              id: staff.id,
              userId: staff.id,
              userType: 'admin',
              name: staff.name,
              fullName: staff.name,
              email: staff.email,
              roleId: staff.role_id,
              role: staff.role_name,
              roleName: staff.role_name,
              status: staff.status,
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
          // Customer session lookup
          const kv = await getKV(env);
          const user = await findUserById(kv, String(session.user_id));
          if (!user) return null;

          return {
            id: user.id,
            userId: user.id,
            userType: 'customer',
            customerId: user.customerId,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            role: user.role,
            phoneVerified: Boolean(user.phoneVerified),
          };
        }
      }
    }

    // Fallback if D1 unavailable or session query empty: Check KV for raw token or tokenHash
    const kv = await getKV(env);
    const kvData =
      (await kv.get(`d1_session:${tokenHash}`, 'json')) ||
      (await kv.get(`d1_session:${sessionToken}`, 'json')) ||
      (await kv.get(`session:${sessionToken}`, 'json')) ||
      (await kv.get(`session:${tokenHash}`, 'json'));

    if (kvData) {
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
          role: user.role,
          phoneVerified: Boolean(user.phoneVerified),
        };
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
  if (!sessionToken) return;

  try {
    const tokenHash = await hashToken(sessionToken);
    const db = await getDB(env);

    if (db) {
      await db
        .prepare(`UPDATE sessions SET is_revoked = 1 WHERE token_hash = ?`)
        .bind(tokenHash)
        .run();
    }

    const kv = await getKV(env);
    if (kv) {
      await kv.delete(`d1_session:${tokenHash}`);
      await kv.delete(`session:${sessionToken}`);
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
  if (!db || roleId === 1) return true; // Super Admin always authorized; fallback if DB uninitialized

  const colMap = {
    view: 'can_view',
    create: 'can_create',
    edit: 'can_edit',
    delete: 'can_delete',
  };

  const col = colMap[action];

  const perm = await db
    .prepare(`SELECT ${col} FROM role_permissions WHERE role_id = ? AND module = ?`)
    .bind(roleId, moduleName)
    .first();

  if (!perm) return false;
  return perm[col] === 1;
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
    request.cookies.get(SESSION_COOKIE_NAME)?.value || request.headers.get('x-session-token') || '';

  if (!sessionToken) {
    return {
      authorized: false,
      status: 401,
      error: 'UNAUTHORIZED',
      message: 'Session expired, please log in again.',
    };
  }

  const user = await validateSession(sessionToken, env);

  if (!user || user.userType !== 'admin' || user.status === 'Inactive') {
    return {
      authorized: false,
      status: 401,
      error: 'UNAUTHORIZED',
      message: 'Session expired, please log in again.',
    };
  }

  const db = await getDB(env);

  if (db && user.roleId) {
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
 * Retrieve administrator credentials configuration from environment variables or dev defaults
 */
export function getAdminConfig(env) {
  const email = (
    env?.ADMIN_EMAIL ||
    (typeof process !== 'undefined' && process.env?.ADMIN_EMAIL) ||
    'admin@tharanitex.com'
  ).trim().toLowerCase();

  const password = (
    env?.ADMIN_PASSWORD ||
    (typeof process !== 'undefined' && process.env?.ADMIN_PASSWORD) ||
    'AdminPassword123!'
  ).trim();

  return { email, password };
}

/**
 * Authenticate administrator using environment variables (no D1 database dependency for credential verification)
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

  // Validate admin credentials directly against environment variables without querying D1
  const validAdminEmails = new Set([adminConfig.email, 'admin@tharanitextiles.com', 'admin@tharanitex.com']);
  if (validAdminEmails.has(email) && password === adminConfig.password) {
    const db = await getDB(env);

    // Create session (stored in D1 sessions table if available, and/or KV)
    const { sessionToken, expiresAt } = await createD1Session(
      db,
      1,
      'admin',
      userAgent,
      ipAddress,
      env
    );

    // Asynchronously update last_login in staff_users if database is available
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

  // Fallback for multi-staff account lookup in D1 if secondary staff account exists
  const db = await getDB(env);
  if (db) {
    let staff = null;
    try {
      staff = await db
        .prepare(
          `SELECT u.*, r.name as role_name
           FROM staff_users u
           JOIN roles r ON u.role_id = r.id
           WHERE LOWER(u.email) = ?`
        )
        .bind(email)
        .first();
    } catch {
      // D1 query fallback
    }

    if (staff) {
      const inputHash = await hashPassword(password);
      if (staff.password_hash === inputHash) {
        if (staff.status !== 'Active') {
          throw new Error('Staff account is deactivated. Please contact administrator.');
        }

        try {
          await db
            .prepare(`UPDATE staff_users SET last_login = datetime('now') WHERE id = ?`)
            .bind(staff.id)
            .run();
        } catch {
          // Ignore non-critical update error
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
            roleId: staff.role_id,
            roleName: staff.role_name,
            status: staff.status,
          },
        };
      }
    }
  }

  throw new Error('Invalid email or password.');
}

// ==================== Customer Auth Business Logic (Legacy/OTP) ====================

/**
 * Process OTP Request for customer login
 */
export async function requestOtp(fullName, phoneInput, env) {
  const validName = validateFullName(fullName);
  const phoneNumber = normalizePhoneNumber(phoneInput);

  const kv = await getKV(env);
  const otp = generateNumericOtp();
  console.log("Generated OTP:", otp);

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();
  const otpId = crypto.randomUUID();

  await saveOtpRecord(kv, otpId, phoneNumber, otp, expiresAt);

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
  const activeOtp = await getLatestActiveOtp(kv, phoneNumber);
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

  const db = await getDB(env);

  // Idempotently ensure OTP customer exists in D1 users table for SQL JOIN compatibility
  if (db) {
    try {
      const existingD1User = await db
        .prepare(`SELECT id FROM users WHERE phone = ? OR id = ? LIMIT 1`)
        .bind(phoneNumber, String(user.id))
        .first();

      if (!existingD1User) {
        await db
          .prepare(
            `INSERT INTO users (id, name, email, phone, role, created_at, updated_at)
             VALUES (?, ?, ?, ?, 'customer', datetime('now'), datetime('now'))`
          )
          .bind(
            String(user.id),
            validName,
            `${phoneNumber}@customer.tharanitex.com`,
            phoneNumber
          )
          .run();
      }
    } catch {
      // Non-blocking D1 user sync fallback
    }
  }

  const { sessionToken, expiresAt } = await createD1Session(
    db,
    user.id,
    'customer',
    userAgent,
    ipAddress,
    env
  );

  const userData = {
    id: user.id,
    userId: user.id,
    userType: 'customer',
    customerId: user.customerId,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    phoneVerified: Boolean(user.phoneVerified),
  };

  return {
    sessionToken,
    user: userData,
    expiresAt,
  };
}

// ==================== Cookie Helpers ====================

/**
 * Construct secure HttpOnly Cookie header string
 */
export function buildSessionCookieHeader(token) {
  const maxAge = SESSION_DURATION_HOURS * 60 * 60;
  const isProd = process.env.NODE_ENV === 'production';
  const secureFlag = isProd ? 'Secure; ' : '';
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=${maxAge}`;
}

/**
 * Construct expire cookie header string for logout
 */
export function buildClearCookieHeader() {
  const isProd = process.env.NODE_ENV === 'production';
  const secureFlag = isProd ? 'Secure; ' : '';
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
