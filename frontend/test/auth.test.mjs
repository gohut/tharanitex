/**
 * Comprehensive Automated Authentication & Security Test Suite
 * Tharani Textiles Production Reliability Verification
 */

import assert from 'node:assert/strict';
import {
  hashPassword,
  hashToken,
  generateSessionToken,
  getAdminConfig,
  adminLogin,
  validateSession,
  logoutSession,
  checkPermission,
  buildSessionCookieHeader,
  buildAdminCookieHeader,
  buildClearCookieHeader,
  buildClearAdminCookieHeader,
} from '../src/lib/auth.js';

// In-Memory SQLite Mock D1 Database Engine for Automated Testing
class MockD1PreparedStatement {
  constructor(db, sql, params = []) {
    this.db = db;
    this.sql = sql;
    this.params = params;
  }

  bind(...params) {
    return new MockD1PreparedStatement(this.db, this.sql, params);
  }

  async first() {
    const results = await this.all();
    return results.results[0] || null;
  }

  async run() {
    return this.db.execute(this.sql, this.params);
  }

  async all() {
    return this.db.query(this.sql, this.params);
  }
}

class MockD1Database {
  constructor() {
    this.tables = {
      sessions: [],
      staff_users: [],
      roles: [],
      role_permissions: [],
      users: [],
      notifications: [],
    };
    this.seed();
  }

  prepare(sql) {
    return new MockD1PreparedStatement(this, sql);
  }

  seed() {
    // Seed Roles
    this.tables.roles = [
      { id: 1, name: 'Super Admin' },
      { id: 2, name: 'Manager' },
      { id: 3, name: 'Support Staff' },
    ];

    // Seed Role Permissions
    const modules = ['Products', 'Orders', 'Customers', 'Reviews', 'CMS', 'Users & Roles', 'Settings'];
    this.tables.role_permissions = [];

    // Super Admin: full access
    for (const mod of modules) {
      this.tables.role_permissions.push({
        id: this.tables.role_permissions.length + 1,
        role_id: 1,
        module: mod,
        can_view: 1,
        can_create: 1,
        can_edit: 1,
        can_delete: 1,
      });
    }

    // Manager
    for (const mod of modules) {
      const isRestricted = mod === 'Users & Roles' || mod === 'Settings';
      this.tables.role_permissions.push({
        id: this.tables.role_permissions.length + 1,
        role_id: 2,
        module: mod,
        can_view: 1,
        can_create: isRestricted ? 0 : 1,
        can_edit: isRestricted ? 0 : 1,
        can_delete: isRestricted ? 0 : 1,
      });
    }

    // Support Staff
    for (const mod of modules) {
      const isOrdersReviews = mod === 'Orders' || mod === 'Reviews';
      const isProductsCustomersShipping = mod === 'Products' || mod === 'Customers' || mod === 'Shipping';
      this.tables.role_permissions.push({
        id: this.tables.role_permissions.length + 1,
        role_id: 3,
        module: mod,
        can_view: isOrdersReviews || isProductsCustomersShipping ? 1 : 0,
        can_create: 0,
        can_edit: isOrdersReviews ? 1 : 0,
        can_delete: 0,
      });
    }

    // Seed Staff Users
    this.tables.staff_users = [
      {
        id: 1,
        name: 'Super Admin',
        email: 'admin@tharanitex.com',
        password_hash: '4b2a2960bfa43e995308d6d7121b4eb38d6951d6e0551fbbbbbfc2e1e0eccf9e', // 'AdminPassword123!' + salt
        role_id: 1,
        status: 'Active',
        last_login: null,
      },
      {
        id: 2,
        name: 'Store Manager',
        email: 'manager@tharanitex.com',
        password_hash: '4b2a2960bfa43e995308d6d7121b4eb38d6951d6e0551fbbbbbfc2e1e0eccf9e',
        role_id: 2,
        status: 'Active',
        last_login: null,
      },
      {
        id: 3,
        name: 'Inactive Staff',
        email: 'inactive@tharanitex.com',
        password_hash: '4b2a2960bfa43e995308d6d7121b4eb38d6951d6e0551fbbbbbfc2e1e0eccf9e',
        role_id: 3,
        status: 'Inactive',
        last_login: null,
      },
    ];

    // Seed Customers in users table
    this.tables.users = [
      {
        id: 101,
        first_name: 'Priya',
        last_name: 'Sharma',
        email: 'priya@example.com',
        phone: '9876543210',
        role: 'customer',
      },
    ];
  }

  execute(sql, params) {
    const s = sql.trim().toUpperCase();

    if (s.startsWith('INSERT INTO SESSIONS')) {
      const [id, user_id, user_type, token_hash, ip_address, user_agent, expires_at] = params;
      const session = {
        id,
        user_id,
        user_type,
        token_hash,
        ip_address,
        user_agent,
        is_revoked: 0,
        created_at: new Date().toISOString(),
        expires_at: expires_at || new Date(Date.now() + (user_type === 'admin' ? 24 : 7 * 24) * 60 * 60 * 1000).toISOString(),
      };
      this.tables.sessions.push(session);
      return { meta: { last_row_id: session.id, changes: 1 } };
    }

    if (s.startsWith('UPDATE SESSIONS SET IS_REVOKED = 1 WHERE TOKEN_HASH')) {
      const [tokenHash] = params;
      for (const row of this.tables.sessions) {
        if (row.token_hash === tokenHash) {
          row.is_revoked = 1;
        }
      }
      return { meta: { changes: 1 } };
    }

    if (s.startsWith('UPDATE SESSIONS SET IS_REVOKED = 1 WHERE USER_ID')) {
      const [userId, userType] = params;
      for (const row of this.tables.sessions) {
        if (row.user_id === userId && row.user_type === userType) {
          row.is_revoked = 1;
        }
      }
      return { meta: { changes: 1 } };
    }

    if (s.startsWith('UPDATE STAFF_USERS SET LAST_LOGIN')) {
      return { meta: { changes: 1 } };
    }

    if (s.startsWith('INSERT INTO NOTIFICATIONS')) {
      return { meta: { changes: 1 } };
    }

    return { meta: { changes: 0 } };
  }

  query(sql, params) {
    const s = sql.trim().toUpperCase();

    if (s.includes('FROM SESSIONS')) {
      const [tokenHash] = params;
      const found = this.tables.sessions.filter(
        (row) =>
          (row.token_hash === tokenHash || row.id === tokenHash) &&
          row.is_revoked === 0 &&
          new Date(row.expires_at).getTime() > Date.now()
      );
      return { results: found };
    }

    if (s.includes('FROM STAFF_USERS') && s.includes('WHERE U.ID')) {
      const [userId] = params;
      const staff = this.tables.staff_users.find((u) => u.id === Number(userId));
      if (staff) {
        const role = this.tables.roles.find((r) => r.id === staff.role_id);
        return {
          results: [
            {
              id: staff.id,
              name: staff.name,
              email: staff.email,
              status: staff.status,
              role_id: staff.role_id,
              role_name: role ? role.name : 'Staff',
            },
          ],
        };
      }
      return { results: [] };
    }

    if (s.includes('FROM STAFF_USERS') && s.includes('LOWER(U.EMAIL)')) {
      const [email] = params;
      const staff = this.tables.staff_users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (staff) {
        const role = this.tables.roles.find((r) => r.id === staff.role_id);
        return {
          results: [
            {
              ...staff,
              role_name: role ? role.name : 'Staff',
            },
          ],
        };
      }
      return { results: [] };
    }

    if (s.includes('FROM USERS') && s.includes('WHERE ID')) {
      const [userId] = params;
      const user = this.tables.users.find((u) => u.id === Number(userId));
      if (user) {
        return {
          results: [
            {
              id: user.id,
              fullName: `${user.first_name} ${user.last_name}`,
              email: user.email,
              phone: user.phone,
              role: user.role,
            },
          ],
        };
      }
      return { results: [] };
    }

    if (s.includes('FROM ROLE_PERMISSIONS')) {
      const [roleId, module] = params;
      const perm = this.tables.role_permissions.find((p) => p.role_id === Number(roleId) && p.module === module);
      return { results: perm ? [perm] : [] };
    }

    return { results: [] };
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('STARTING AUTOMATED AUTHENTICATION TEST SUITE');
  console.log('====================================================\n');

  const mockDb = new MockD1Database();
  const testEnv = {
    DB: mockDb,
    ADMIN_EMAIL: 'admin@tharanitextiles.com',
    ADMIN_PASSWORD: 'AdminPassword123!',
  };

  // 1. Password & Token Hashing
  console.log('[TEST 1] Testing cryptographic hashing...');
  const passHash = await hashPassword('AdminPassword123!');
  assert.equal(passHash, '4b2a2960bfa43e995308d6d7121b4eb38d6951d6e0551fbbbbbfc2e1e0eccf9e');
  const token = generateSessionToken();
  const tokenHash = await hashToken(token);
  assert.equal(tokenHash.length, 64, 'SHA-256 token hash must be 64 hex characters');
  console.log('✓ Password & Token hashing verified.');

  // 2. Admin Credentials Configuration
  console.log('[TEST 2] Testing Admin credentials config resolution...');
  const config = getAdminConfig(testEnv);
  assert.equal(config.email, 'admin@tharanitextiles.com');
  assert.equal(config.password, 'AdminPassword123!');
  console.log('✓ Admin config resolution verified.');

  // 3. Super Admin Login Flow
  console.log('[TEST 3] Testing Super Admin login & D1 session generation...');
  const loginRes = await adminLogin('admin@tharanitextiles.com', 'AdminPassword123!', 'test-agent', '127.0.0.1', testEnv);
  assert.ok(loginRes.sessionToken, 'Session token must be returned');
  assert.equal(loginRes.user.roleName, 'Super Admin');
  assert.equal(loginRes.user.status, 'Active');

  // Verify Session in D1
  const sessionUser = await validateSession(loginRes.sessionToken, testEnv);
  assert.ok(sessionUser, 'D1 Session must resolve valid user');
  assert.equal(sessionUser.userType, 'admin');
  assert.equal(sessionUser.roleName, 'Super Admin');
  console.log('✓ Super Admin login and session lookup verified.');

  // 4. Staff Account (Manager) Login Flow
  console.log('[TEST 4] Testing secondary staff user (Manager) login...');
  const managerLogin = await adminLogin('manager@tharanitex.com', 'AdminPassword123!', 'test-agent', '127.0.0.1', testEnv);
  assert.equal(managerLogin.user.roleName, 'Manager');
  const managerSession = await validateSession(managerLogin.sessionToken, testEnv);
  assert.equal(managerSession.roleName, 'Manager');
  assert.equal(managerSession.roleId, 2);
  console.log('✓ Secondary staff user login verified.');

  // 5. Inactive Staff Rejection
  console.log('[TEST 5] Testing inactive staff rejection...');
  await assert.rejects(
    async () => {
      await adminLogin('inactive@tharanitex.com', 'AdminPassword123!', 'test-agent', '127.0.0.1', testEnv);
    },
    /Staff account is deactivated/,
    'Inactive accounts must be rejected'
  );
  console.log('✓ Inactive account correctly rejected.');

  // 6. Invalid Credentials Rejection
  console.log('[TEST 6] Testing invalid credentials rejection...');
  await assert.rejects(
    async () => {
      await adminLogin('admin@tharanitextiles.com', 'WrongPassword!', 'test-agent', '127.0.0.1', testEnv);
    },
    /Invalid email or password/,
    'Invalid passwords must be rejected'
  );
  console.log('✓ Invalid credentials correctly rejected.');

  // 7. Role Permission Matrix
  console.log('[TEST 7] Testing role permissions matrix...');
  // Super Admin (Role 1) -> full access
  assert.equal(await checkPermission(mockDb, 1, 'Settings', 'delete'), true);
  // Manager (Role 2) -> can edit products, cannot edit settings
  assert.equal(await checkPermission(mockDb, 2, 'Products', 'edit'), true);
  assert.equal(await checkPermission(mockDb, 2, 'Settings', 'edit'), false);
  // Support Staff (Role 3) -> can view products, cannot create products
  assert.equal(await checkPermission(mockDb, 3, 'Products', 'view'), true);
  assert.equal(await checkPermission(mockDb, 3, 'Products', 'create'), false);
  console.log('✓ Role permission matrix verified.');

  // 8. Session Logout & Revocation
  console.log('[TEST 8] Testing session logout and invalidation...');
  await logoutSession(loginRes.sessionToken, testEnv);
  const revokedUser = await validateSession(loginRes.sessionToken, testEnv);
  assert.equal(revokedUser, null, 'Revoked session must return null');
  console.log('✓ Session invalidation verified.');

  // 9. Cookie Header Verification
  console.log('[TEST 9] Testing Cookie header formats & Max-Age...');
  const testCookieToken = 'test_token_123';
  const sessionHeader = buildSessionCookieHeader(testCookieToken);
  assert.ok(sessionHeader.includes('tharanitex_session=test_token_123'));
  assert.ok(sessionHeader.includes('HttpOnly'));
  assert.ok(sessionHeader.includes('Path=/'));
  assert.ok(sessionHeader.includes('Max-Age=604800'), 'Customer session must be 7 days (604800s)');

  const adminHeader = buildAdminCookieHeader(testCookieToken);
  assert.ok(adminHeader.includes('admin_token=test_token_123'));
  assert.ok(adminHeader.includes('HttpOnly'));
  assert.ok(adminHeader.includes('Max-Age=86400'), 'Admin session must be 24 hours (86400s)');

  const clearSessionHeader = buildClearCookieHeader();
  assert.ok(clearSessionHeader.includes('Max-Age=0'));

  const clearAdminHeader = buildClearAdminCookieHeader();
  assert.ok(clearAdminHeader.includes('Max-Age=0'));
  console.log('✓ Cookie headers verified.');

  // 10. Repeated Login Resilience (25 consecutive cycles)
  console.log('[TEST 10] Testing repeated admin login cycles (25 iterations)...');
  for (let i = 1; i <= 25; i++) {
    const cycleLogin = await adminLogin('admin@tharanitextiles.com', 'AdminPassword123!', 'stress-test-agent', '127.0.0.1', testEnv);
    const cycleUser = await validateSession(cycleLogin.sessionToken, testEnv);
    assert.ok(cycleUser, `Iteration ${i} session lookup failed`);
    assert.equal(cycleUser.userType, 'admin');
    await logoutSession(cycleLogin.sessionToken, testEnv);
    const cycleRevoked = await validateSession(cycleLogin.sessionToken, testEnv);
    assert.equal(cycleRevoked, null, `Iteration ${i} revocation failed`);
  }
  console.log('✓ 25/25 repeated login cycles succeeded deterministically.');

  // 11. Customer Session Resolution
  console.log('[TEST 11] Testing customer D1 session resolution...');
  const rawCustToken = 'cust_raw_token_xyz123';
  const hashedCustToken = await hashToken(rawCustToken);
  mockDb.execute('INSERT INTO SESSIONS', [
    'sess_cust_1',
    101,
    'customer',
    hashedCustToken,
    '127.0.0.1',
    'test-agent'
  ]);
  const customerUser = await validateSession(rawCustToken, testEnv);
  assert.ok(customerUser, 'Customer session must resolve');
  assert.equal(customerUser.userType, 'customer');
  assert.equal(customerUser.role, 'customer');
  assert.equal(customerUser.fullName, 'Priya Sharma');
  console.log('✓ Customer session correctly resolved.');

  // 12. Security Boundary: Customer Session Must NEVER Grant Admin Privileges
  console.log('[TEST 12] Testing customer -> admin escalation denial...');
  const customerAdminCheck = await validateSession(rawCustToken, testEnv);
  assert.notEqual(customerAdminCheck.userType, 'admin');
  const fakeAdminReq = {
    cookies: { get: () => ({ value: rawCustToken }) },
    headers: { get: () => null }
  };
  const { enforceAdminPermission } = await import('../src/lib/auth.js');
  const permCheck = await enforceAdminPermission(fakeAdminReq, 'Products', 'edit', testEnv);
  assert.equal(permCheck.authorized, false, 'Customer token must be strictly rejected from admin permission check');
  assert.equal(permCheck.status, 403, 'Must return 403 Forbidden');
  console.log('✓ Customer token strictly denied admin privileges (403 Forbidden).');

  // 13. Session Expiration Verification
  console.log('[TEST 13] Testing expired session rejection...');
  const expiredRawToken = 'expired_raw_token_abc';
  const expiredHash = await hashToken(expiredRawToken);
  const pastDate = new Date(Date.now() - 3600000).toISOString(); // 1 hour in the past
  mockDb.execute('INSERT INTO SESSIONS', [
    'sess_expired_1',
    1,
    'admin',
    expiredHash,
    '127.0.0.1',
    'test-agent',
    pastDate
  ]);
  const expiredCheck = await validateSession(expiredRawToken, testEnv);
  assert.equal(expiredCheck, null, 'Expired session must return null');
  console.log('✓ Expired session correctly rejected.');

  console.log('\n====================================================');
  console.log('ALL 13 AUTOMATED SECURITY & AUTH TEST SUITES PASSED!');
  console.log('====================================================');
}

runTests().catch((err) => {
  console.error('TEST SUITE FAILED:', err);
  process.exit(1);
});
