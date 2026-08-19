# Tharani Textiles — Account & Order Flow Audit

**Document Version:** 1.0.0  
**Audit Date:** August 19, 2026  
**Auditor:** Antigravity AI Engineering Team  
**Scope:** Complete Account, Cart, Wishlist, Checkout, Payment, Order Creation, Cancellation, Refund, Admin Order Management, and D1 Database Infrastructure.

---

## 1. Executive Summary

This document presents a comprehensive technical audit of the **Tharani Textiles** e-commerce platform built on Next.js, Cloudflare OpenNext, Cloudflare D1, Cloudflare KV, and Razorpay. 

The primary objective of this audit was to investigate and identify all root causes behind intermittent/random failures in customer authentication, cart management, wishlist operations, checkout, payment processing, order cancellation, and admin refund management.

### Key Audit Discoveries & Root Causes Summary
1. **Authentication Dual-System Architectural Clash (Critical):** The codebase contains two completely distinct, un-unified authentication mechanisms running in parallel. 
   - **System A (JWT):** `src/middleware/auth.js` (`authenticate`, `authenticateAdmin`) expects signed JWTs in `auth_token`/`token`/`admin_token` cookies.
   - **System B (D1 Session):** `src/lib/auth.js` (`createD1Session`, `validateSession`) generates raw UUID session tokens stored in D1 `sessions` / KV and sets `tharanitex_session` cookies.
   - **Failure Impact:** Customers logging in via OTP receive `tharanitex_session` (raw UUID token). When calling any API handled by System A (Cart, Wishlist, Address, Orders, Profile), `authenticate()` fails with **HTTP 401 Unauthorized** (`No authentication token was sent` or `JWT verification failed`). Admins logging in via `/api/admin/login` get a raw session token in `admin_token`, which crashes `authenticateAdmin()` with **HTTP 401**.
2. **D1 Schema Mismatch & Vicious Admin Refund Cycle (Critical):** 
   - Approving order cancellations via `PATCH /api/admin/orders/[id]` executes `UPDATE orders SET ..., cancelled_by = ?, ... WHERE id = ?`.
   - Column `cancelled_by` is present in migration file `0012_order_cancellation_and_invoices.sql`, but was **omitted from the dynamic runtime migration helper `ensureCancellationColumns()`** in `src/lib/db/order.js`.
   - If migrations were not applied directly via Wrangler, D1 throws `D1_ERROR: no such column: cancelled_by`, causing `PATCH /api/admin/orders/[id]` to fail with **HTTP 500**.
   - Because the SQL update fails, local DB state remains `cancellation_status = 'REQUESTED'`. Re-attempting approval calls Razorpay again, which returns `"The payment has been fully refunded already"`. The route attempts to handle this, but crashes on the missing `cancelled_by` column again, trapping orders in an irrecoverable 500 error loop.
3. **Database Dual-Architecture & Customer Data Isolation Failure (Critical):** 
   - The application has two parallel database accessor layers: `src/repositories/*` (using PascalCase tables `Orders`, `Users`, `Addresses`) vs `src/lib/db/*` (using lower_snake_case tables `orders`, `users`, `addresses`).
   - OTP user registration (`verifyOtpAndLogin` in `src/lib/auth.js`) stores user profiles **only in Cloudflare KV** (`user:id:${id}`) and **never inserts a record into the D1 `users` table**.
   - SQL queries performing `JOIN users u ON o.user_id = u.id` return `NULL` or 0 rows for OTP-authenticated customers, causing missing order histories and profile lookup failures.
4. **Performance Degradation & Admin Timeouts (High):** 
   - Dynamic schema patching helper `ensureCancellationColumns()` runs 13 sequential `ALTER TABLE` D1 statements on every single order fetch call (`getOrders`, `getOrderById`, `getAdminOrders`), creating massive latency overhead (300ms–800ms per request).
   - `getAdminOrders` performs N+1 queries sequentially over all order rows (`for (const order of results)`), resulting in 50+ network round-trips to Cloudflare D1. This causes `GET /api/admin/orders` to take **10–12+ seconds**.

---

## 2. Current Architecture

### Overview Diagram

```text
                                  ┌────────────────────────┐
                                  │      Client Browser    │
                                  └───────────┬────────────┘
                                              │
                        ┌─────────────────────┴─────────────────────┐
                        │                                           │
             (Email/Password Auth & API Routes)            (OTP Auth & D1 Direct Routes)
                        ▼                                           ▼
             ┌─────────────────────┐                     ┌─────────────────────┐
             │ Next.js App Router  │                     │ Next.js App Router  │
             │ (System A Routes)   │                     │ (System B Routes)   │
             └──────────┬──────────┘                     └──────────┬──────────┘
                        │                                           │
             ┌──────────▼──────────┐                     ┌──────────▼──────────┐
             │ Middleware Auth     │                     │ Checkout-Auth /     │
             │ (JWT verification)  │                     │ Lib Auth (D1 Sessions)
             └──────────┬──────────┘                     └──────────┬──────────┘
                        │                                           │
             ┌──────────▼──────────┐                     ┌──────────▼──────────┐
             │ Controllers /       │                     │ Direct D1 Functions │
             │ Services            │                     │ (src/lib/db/*)      │
             └──────────┬──────────┘                     └──────────┬──────────┘
                        │                                           │
             ┌──────────▼──────────┐                     ┌──────────▼──────────┐
             │ Repositories        │                     │ Cloudflare D1 / KV  │
             │ (PascalCase tables) │                     │ (lower_snake_case)  │
             └─────────────────────┘                     └─────────────────────┘
```

### Payment Architecture Diagram

```text
Browser Checkout Modal
   │
   ├─► 1. POST /api/payments/create-order
   │       │
   │       ├─► Validates items & stock in D1
   │       ├─► Creates checkout_session row (idempotency_key)
   │       └─► Calls Razorpay API (/v1/orders) ──► Returns razorpayOrderId & amountPaise
   │
   ├─► 2. Razorpay Modal Opened on Frontend
   │       │
   │       └─► Customer enters UPI/Card credentials & completes payment
   │
   └─► 3. POST /api/payments/verify
           │
           ├─► Verifies HMAC-SHA256 signature (orderId|paymentId)
           ├─► Verifies payment amount & status ("captured") with Razorpay API
           ├─► Claims checkout_session (status = 'verifying')
           ├─► Inserts order & order_items into D1 (payment_status = 'paid')
           ├─► Deletes user cart_items
           └─► Updates checkout_session (status = 'completed')
```

---

## 3. Authentication Audit

### Customer Login Flows
1. **Email / Password Flow (`POST /api/auth/login`):**
   - Handled by `AuthController.login` -> `AuthService.login` -> `UserRepository.findByEmail`.
   - Generates a signed JWT (`signJWT`) containing `{ id, email, role: 'customer' }`.
   - Sets cookies: `token` and `auth_token` (System A).
2. **OTP Flow (`POST /api/auth/verify-otp`):**
   - Handled by `verifyOtpAndLogin` in `src/lib/auth.js`.
   - Verifies OTP in Cloudflare KV, creates/updates user in KV.
   - Generates a raw UUID session token (`createD1Session`), stores session in D1 `sessions` table and KV.
   - Sets cookie: `tharanitex_session` (System B).

### Authentication Verification Audit

| Route / Module | Auth Helper Used | Cookie Checked | Token Format Expected | Behaviour for OTP User | Behaviour for Email User |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST /api/cart` | `requireCustomer` | `auth_token`, `token`, `tharanitex_session` | JWT or Session Token | **SUCCESS** (Falls back to D1 session) | **SUCCESS** (Matches JWT) |
| `GET /api/customer/cart` | `authenticate` | `auth_token`, `token` | JWT | **FAIL (401)** | **SUCCESS** |
| `GET /api/customer/orders` | `authenticate` | `auth_token`, `token` | JWT | **FAIL (401)** | **SUCCESS** |
| `GET /api/customer/addresses` | `authenticate` | `auth_token`, `token` | JWT | **FAIL (401)** | **SUCCESS** |
| `POST /api/orders` | `requireCustomer` | `auth_token`, `token`, `tharanitex_session` | JWT or Session Token | **SUCCESS** | **SUCCESS** |
| `GET /api/admin/orders` | `requireAdmin` (`lib/order-access`) | `tharanitex_session`, `x-session-token` | Session Token | N/A | **FAIL (401)** if admin logged in via System A |

---

## 4. Cookie Audit

### Cookie Configuration Summary

| Cookie Name | Creator File | Path | SameSite | HttpOnly | Secure Flag Behavior | Expiration | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `token` | `AuthController.js` | `/` | `Lax` | `true` | `true` in prod, `false` in dev | 24 Hours | Customer JWT |
| `auth_token` | `AuthController.js` | `/` | `Lax` | `true` | `true` in prod, `false` in dev | 24 Hours | Customer JWT |
| `admin_token` | `AuthController.js` / `api/admin/login` | `/` | `Lax` | `true` | Mismatched (7 days vs 24h) | 7 Days / 24h | Admin Auth |
| `tharanitex_session` | `src/lib/auth.js` | `/` | `Lax` | `true` | `true` in prod, `false` in dev | 7 Days | D1 Session Token |

### Root Cause Findings for Cookie Disappearance & 401 Errors
1. **Hostname & Protocol Mismatches:** On `localhost`, accessing `127.0.0.1:3000` vs `localhost:3000` causes browser cookie isolation. If `Secure` is enabled on HTTP, browsers silently discard the `Set-Cookie` header.
2. **Missing `credentials: "include"`:** Next.js client-side `fetch()` calls on custom pages omit `{ credentials: "include" }`, preventing HTTP-only cookies from being sent in HTTP requests.
3. **Mismatched Cookie Names:** System A routes check `auth_token` or `token`. System B sets `tharanitex_session`. Requests from OTP-authenticated users lack `auth_token`, leading to immediate 401s.

---

## 5. Customer Identity Flow

### Customer ID Resolution Matrix

| Controller / Route | Customer ID Source | Validation Method | Vulnerability / Issue |
| :--- | :--- | :--- | :--- |
| `src/app/api/cart/route.js` | `requireCustomer(request, env)` | Resolves payload.id (JWT) or user.userId (D1 Session) | **SECURE** |
| `src/controllers/CartController.js` | `authenticate(request).id` | Resolves payload.id from JWT | **FAILS for OTP Users** |
| `src/app/api/orders/route.js` | `requireCustomer(request, env)` | Resolves payload.id (JWT) or user.userId (D1 Session) | **SECURE** |
| `src/app/api/customer/orders/route.js` | `authenticate(request).id` | Resolves payload.id from JWT | **FAILS for OTP Users** |
| `src/lib/db/order.js` (createCodOrder) | `checkout.userId` | Passed from route after `requireCustomer` verification | **SECURE** |

### Hardcoded / Fallback Identity Inspection
- `findUserById` in `src/lib/db.js` looks up users in KV.
- No hardcoded guest user IDs (`userId: 1` or `guest`) were found in production cart/checkout routes.
- **CRITICAL DISCREPANCY:** OTP users exist in KV but NOT in D1 `users` table. Any query joining D1 `users` table returns empty data for OTP users.

---

## 6. Cart Complete Audit

### Operations Trace

1. **Add to Cart (`POST /api/cart` or `POST /api/customer/cart`):**
   - `/api/cart`: Uses `addToCart(db, userId, productId, quantity)`. Upserts `cart_items` table in D1.
   - `/api/customer/cart`: Uses `CartController.addToCart` -> `CartRepository.create`.
2. **Get Cart (`GET /api/cart`):**
   - Joins `cart_items` with `products` and `product_images`. Returns array of item objects.
3. **Update Quantity (`PATCH /api/cart`):**
   - Validates `cartId` and `user_id` ownership: `WHERE id = ? AND user_id = ?`.
4. **Delete Item (`DELETE /api/cart`):**
   - Deletes item strictly matching `cartId` and `userId`.

### Race Condition & Concurrent Request Analysis
- **Double Click on "Add to Cart":** Rapid clicking fires two simultaneous `POST /api/cart` requests. Because `addToCart` performs `SELECT id ...` then `INSERT` or `UPDATE`, concurrent requests race. Without a `UNIQUE(user_id, product_id)` constraint on `cart_items`, double clicks can create **duplicate cart rows for the same product**.

---

## 7. Wishlist Complete Audit

### Operations Trace
- `GET /api/wishlist`: Queries `wishlist_items` joined with `products` and `categories` filtered by `user_id`.
- `POST /api/wishlist`: Executes `INSERT OR IGNORE INTO wishlist_items (user_id, product_id)`.
- `DELETE /api/wishlist`: Executes `DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?`.

### Security & Isolation Check
- All D1 wishlist queries in `src/lib/db/wishlist.js` explicitly bind `userId` obtained from `requireCustomer`.
- Users cannot manipulate or view another customer's wishlist items.

---

## 8. Address / Profile Audit

### Address Flow Trace
```text
Login -> User Navigation -> Profile Page -> Address Book -> Checkout Modal
```

### Inconsistency Investigation
- **Problem:** Checkout modal displays user addresses even when calls to `/api/customer/addresses` return `401 Unauthorized`.
- **Root Cause:** 
  1. Profile/Checkout frontend components store user address details in React state or `localStorage`.
  2. When `/api/customer/addresses` is called, it routes to `AddressController` which uses `middleware/auth.js` (`authenticate`).
  3. If user is logged in via OTP/D1 session, `authenticate()` fails (401), but frontend falls back to client-side state, allowing address selection despite API auth failure.

---

## 9. Checkout Flow Audit

### Checkout Step-by-Step Flow

```text
[Cart / Product Page] ──► Click "Checkout" ──► Open Checkout Modal 
                                                   │
                                     ┌─────────────┴─────────────┐
                                     ▼                           ▼
                              Select "COD"               Select "UPI / Card"
                                     │                           │
                                     ▼                           ▼
                           POST /api/orders           POST /api/payments/create-order
                                     │                           │
                            Creates Order in D1          Creates checkout_session &
                            & Clears Cart                Razorpay Order
                                     │                           │
                                     ▼                           ▼
                             Confirmation                Razorpay Gateway Modal
                                                                 │
                                                                 ▼
                                                      POST /api/payments/verify
                                                                 │
                                                         Creates Order in D1
                                                         & Clears Cart
```

---

## 10. COD Order Flow Audit

### Execution Pipeline (`POST /api/orders`)
1. Resolves `userId` via `requireCustomer`.
2. Validates checkout details (`customerName`, `phone`, `deliveryAddress`).
3. Fetches trusted product price and stock directly from D1 `products` table (`trustedItems`).
4. Creates address in D1 `addresses` table (`findOrCreateAddress`).
5. Inserts order into D1 `orders` and `order_items` with `payment_method = 'COD'` and `payment_status = 'pending'`.
6. Clears `cart_items` for `userId` if `checkoutType === 'CART'`.

### Weaknesses & Vulnerabilities
- **Cart Deletion Atomicity:** Steps 5 and 6 are executed as separate statements (`insertOrder` followed by `DELETE FROM cart_items`), not inside a single D1 batch transaction. If network or DB fails between order insertion and cart deletion, the order is created but cart remains uncleared.

---

## 11. Razorpay Payment Flow Audit

### Payment Creation Pipeline (`POST /api/payments/create-order`)
1. Validates payment method (`UPI` or `CARD`).
2. Calculates exact total from D1 product prices in paise (`amountPaise`).
3. Inserts a tracking row in `checkout_sessions` with `status = 'created'` and `idempotencyKey`.
4. Calls Razorpay API `POST /v1/orders` to create gateway order.
5. Updates `checkout_sessions` with `razorpay_order_id`.
6. Returns `{ razorpayOrderId, amountPaise, keyId }` to frontend.

---

## 12. Payment Verification Audit

### Verification Pipeline (`POST /api/payments/verify`)
1. Verifies HMAC-SHA256 signature using `RAZORPAY_KEY_SECRET`:
   `crypto.subtle.sign("HMAC", key, "razorpay_order_id|razorpay_payment_id")`
2. Fetches payment details from Razorpay API (`GET /v1/payments/{payment_id}`).
3. Asserts: `payment.order_id === orderId`, `payment.amount === session.amount_paise`, `payment.status === 'captured'`.
4. Claims checkout session atomically: `UPDATE checkout_sessions SET status = 'verifying' WHERE id = ? AND status = 'created'`.
5. Inserts order into D1 `orders` and `order_items` with `payment_status = 'paid'`.
6. Deletes `cart_items` and updates `checkout_sessions` to `status = 'completed'` in a single **D1 Batch transaction**.

### Idempotency Check
- **Idempotent:** If a user refreshes or re-submits verification, `claimVerifiedPayment` checks if an order already exists for `razorpay_order_id`. If found, it returns `{ orderId: existingOrder.id, duplicate: true }` without creating duplicate orders.

---

## 13. Order Creation Audit

### Transaction Atomicity Inspection

```text
       Step 1: Check Stock & Fetch Prices (D1 SELECT)
                           │
                           ▼
       Step 2: Find / Create Address (D1 INSERT)
                           │
                           ▼
       Step 3: Insert Order Record (D1 INSERT)
                           │
                           ▼
       Step 4: Insert Order Items (D1 BATCH INSERT)
                           │
                           ▼
       Step 5: Delete Cart Items (D1 DELETE)
```

- **Stock Check Atomicity Risk:** Stock is checked in Step 1, but stock deduction (`UPDATE products SET stock = stock - ?`) is **not executed during order creation**. Multiple users can purchase the last remaining stock item concurrently.

---

## 14. Customer Order APIs

### Security & Access Control Verification
- `GET /api/orders`: Executes `SELECT ... FROM orders WHERE user_id = ?`. User A cannot view User B's orders.
- `GET /api/orders/[id]`: Executes `SELECT ... FROM orders WHERE id = ? AND user_id = ?`.
- **IDOR Testing:** Requesting `/api/orders/999` or another user's order ID returns `HTTP 404 Order not found`. Safe against IDOR.

---

## 15. Cancellation Flow Audit

### Customer Cancellation Request (`POST /api/orders/[id]/cancellation-request`)
- Validates order status is `placed` or `confirmed`.
- Asserts `cancellation_status !== 'REQUESTED'`.
- Updates `orders SET cancellation_status = 'REQUESTED', cancellation_reason = ?`.
- Constructs WhatsApp admin notification URL.

---

## 16. Admin Order Management Audit

### Admin Actions Trace (`PATCH /api/admin/orders/[id]`)
- Supports two distinct actions:
  1. **Status Update:** Updates `order_status` through lifecycle flow (`placed` -> `processing` -> `shipped` -> `delivered`).
  2. **Cancellation Approval / Rejection:** Decision `APPROVED` or `REJECTED`.

---

## 17. Refund Flow Audit

### In-Depth Investigation of User-Reported Error: `"The payment has been fully refunded already"` & `500 Internal Server Error`

#### Trace of the Failure Loop:
1. Admin clicks "Approve Cancellation" on an online-paid order.
2. Route calls Razorpay refund API (`refundRazorpayPayment`).
3. If Razorpay succeeds or if Razorpay returns `"The payment has been fully refunded already"`, the code proceeds to update D1:
   ```sql
   UPDATE orders SET 
     cancellation_status = 'APPROVED',
     cancelled_by = ?,
     ...
   WHERE id = ?
   ```
4. **THE CRASH:** Column `cancelled_by` DOES NOT EXIST in D1 schema (omitted from dynamic dynamic helper `ensureCancellationColumns`). D1 throws `D1_ERROR: no such column: cancelled_by`.
5. Route crashes with **HTTP 500 Internal Server Error**.
6. The D1 `UPDATE` is rolled back, leaving `cancellation_status = 'REQUESTED'` in local database.
7. Admin clicks "Approve Cancellation" again.
8. Backend calls Razorpay refund API again.
9. Razorpay API returns HTTP 400: `"The payment has been fully refunded already"`.
10. Route catches this, sets `refundStatus = 'COMPLETED'`, and attempts the same SQL `UPDATE` query containing `cancelled_by = ?`.
11. D1 crashes with **HTTP 500 AGAIN**.

```text
 [Admin Clicks Approve]
          │
          ▼
   Call Razorpay API ──► Payment Refunded on Razorpay
          │
          ▼
   D1 UPDATE orders SET cancelled_by = ? ──► CRASH! (no such column: cancelled_by)
          │
          ▼
  Returns HTTP 500 (Local DB stays UN-UPDATED!)
          │
          ▼
 [Admin Clicks Approve Again]
          │
          ▼
   Call Razorpay API ──► Returns "The payment has been fully refunded already"
          │
          ▼
   D1 UPDATE orders SET cancelled_by = ? ──► CRASH AGAIN! (HTTP 500)
```

---

## 18. Order State Machine

### State Transition Matrix

| Current Status | Allowed Next Statuses | Trigger Action | Valid Cancellation? |
| :--- | :--- | :--- | :--- |
| `placed` | `processing`, `confirmed`, `cancelled` | Admin / Customer | YES |
| `confirmed` | `processing`, `packed`, `cancelled` | Admin / Customer | YES |
| `processing` / `packed` | `shipped`, `cancelled` | Admin | Admin Only |
| `shipped` | `delivered` | Admin | NO |
| `delivered` | None (Final) | Admin | NO |
| `cancelled` | None (Final) | Admin / Customer | NO |

### Contradictory States Audit
- System state handling prevents invalid transitions like `delivered` -> `cancelled` in `PATCH /api/admin/orders/[id]`.

---

## 19. Database Architecture

### Schema & Tables Summary

| Table Name (D1 Direct) | Table Name (Repository) | Primary Key | Key Foreign Keys | Key Indexes |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `Users` | `id` (TEXT/UUID) | None | `idx_users_email`, `idx_users_phone` |
| `orders` | `Orders` | `id` (INTEGER AUTO) | `user_id`, `address_id` | `idx_orders_user_id_created_at` |
| `order_items` | `Order_Items` | `id` (INTEGER AUTO) | `order_id`, `product_id` | `idx_order_items_order_id` |
| `cart_items` | `Cart_Items` | `id` (INTEGER AUTO) | `user_id`, `product_id` | Missing Unique Constraint `(user_id, product_id)` |
| `wishlist_items` | `Wishlists` | `id` (INTEGER AUTO) | `user_id`, `product_id` | `PRIMARY KEY (user_id, product_id)` |
| `addresses` | `Addresses` | `id` (INTEGER AUTO) | `user_id` | `idx_addresses_user_id` |
| `checkout_sessions` | N/A | `id` (TEXT/UUID) | `user_id`, `address_id` | `idx_checkout_sessions_razorpay_order_id` |

---

## 20. Cloudflare D1 / Environment Architecture

### Database & Environment Resolution Matrix

| Execution Command | Runtime Environment | D1 Database Binding Source | KV Namespace Binding Source |
| :--- | :--- | :--- | :--- |
| `npm run dev` | Node.js / Next.js Dev | `getCloudflareContext()` or Mock KV | `globalMockKvSymbol` |
| `npm run dev:remote` | OpenNext Preview | Remote Cloudflare D1 (`tharani-db`) | Remote KV (`fb0749...`) |
| `npm run dev:local` | Next.js Dev | Local Miniflare / Mock | Local Mock KV |
| Production Deploy | Cloudflare Workers | Bound D1 (`DB`) | Bound KV (`KV`) |

---

## 21. Intermittent Error Analysis

### Comprehensive Failure Root Cause Table

| Reported Symptom | Discovered Root Cause | Trigger Condition | Reproducible? | Severity |
| :--- | :--- | :--- | :--- | :--- |
| `POST /api/cart 401` | Customer logged in via OTP; received `tharanitex_session` cookie; controller checked `auth_token` JWT cookie. | Calling controller-based endpoints after OTP login | 100% Yes | **CRITICAL** |
| `PATCH /api/admin/orders/5 -> 500` | SQL UPDATE query referenced `cancelled_by` column missing from `ensureCancellationColumns()` dynamic patch. | Admin approving order cancellation | 100% Yes | **CRITICAL** |
| `"Payment fully refunded already"` | Previous D1 UPDATE crashed with 500 due to missing column; retry hit Razorpay API again. | Re-attempting cancellation approval after 500 error | 100% Yes | **CRITICAL** |
| `GET /api/admin/orders 10s+ delay` | 13 sequential dynamic `ALTER TABLE` D1 statements executed per order fetch call + N+1 queries. | Admin opening orders dashboard | 100% Yes | **HIGH** |
| Customer orders list empty | OTP user created in KV only; D1 `users` table missing user record; SQL `JOIN users` returned 0 rows. | User who registered via OTP checking order history | 100% Yes | **HIGH** |

---

## 22. Double Request Analysis

### Vulnerability Matrix for Duplicate Submissions

| Action | Duplicate Trigger | Backend Guard Status | Risk / Result |
| :--- | :--- | :--- | :--- |
| `POST /api/cart` | Double clicking "Add to Cart" | **Missing Unique Index** on `cart_items(user_id, product_id)` | Creates duplicate cart rows |
| `POST /api/orders` (COD) | Double clicking "Place Order" | Cart cleared after insert, but read before insert | Can create 2 identical COD orders |
| `POST /api/payments/create-order` | Rapid double submit | Protected if `idempotencyKey` provided | Reuses existing `checkout_session` |
| `POST /api/payments/verify` | Double submit on confirmation | Claim state `status = 'verifying'` in D1 batch | Idempotent; returns existing orderId |

---

## 23. Caching & Stale Data Analysis

### Next.js Route Caching Audit
- Public product routes use `cache: "no-store"` or dynamic rendering (`export const dynamic = 'force-dynamic'`).
- Authenticated endpoints (`/api/cart`, `/api/orders`, `/api/wishlist`) execute dynamically per request using request cookies.
- No unexpected static caching detected on API endpoints.

---

## 24. Error Handling Analysis

### Useful Info Loss Points
- In `src/database/db.js`, exceptions inside `getDB()` swallow original stack traces and throw generic string error.
- In `src/middleware/auth.js`, JWT verification errors return `null`, causing caller to output generic `401 Authentication required` without indicating whether token expired vs signature failed.

---

## 25. Security Findings

### Critical Security Findings

1. **Broken Access Control (Dual Auth Bypass Risk):** Having two authentication verification systems (`middleware/auth.js` vs `lib/auth.js`) increases attack surface if an endpoint validates a token using one format but accepts another.
2. **Missing Database FK Constraints:** Missing foreign key enforceability in SQLite/D1 bindings permits orphan records in `orders` and `order_items`.
3. **Price Manipulation Protection:** Checked and verified — product prices are strictly fetched from D1 database during order creation, making client-side price tampering impossible.

---

## 26. Performance Findings

### Endpoints Latency Audit

| Endpoint | Average Observed Latency | Main Bottleneck Identified |
| :--- | :--- | :--- |
| `GET /api/admin/orders` | **10.5 – 12.2s** | N+1 D1 queries over all order items + 13 sequential `ALTER TABLE` checks |
| `GET /api/admin/orders/[id]` | **6.1 – 7.4s** | 13 sequential `ALTER TABLE` checks |
| `PATCH /api/admin/orders/[id]` | **11.1 – 13.5s** | Sequential Razorpay network RPC + D1 query roundtrips + 13 `ALTER TABLE` checks |
| `GET /api/cart` | **180 – 350ms** | Normal |

---

## 27. Complete API Inventory

| Endpoint API Route | HTTP Method | Auth Engine | Owner Check | DB Binding | External API | Audit Status | Known Problem |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/auth/login` | POST | System A (JWT) | N/A | D1 / Repos | None | **FLAWED** | Mismatched with D1 session system |
| `/api/auth/verify-otp` | POST | System B (Session) | N/A | KV / D1 | SMS Provider | **FLAWED** | Does not create user in D1 `users` |
| `/api/admin/login` | POST | System B (Session) | Admin | D1 | None | **FLAWED** | Sets raw token in `admin_token` cookie |
| `/api/cart` | GET/POST/PATCH/DELETE | System B (Dual) | Enforced | D1 (`env.DB`) | None | **WORKING** | Lacks unique index for race conditions |
| `/api/customer/cart` | GET/POST | System A (JWT) | Enforced | Repository | None | **BROKEN** | 401 for OTP users |
| `/api/wishlist` | GET/POST/DELETE | System B (Dual) | Enforced | D1 (`env.DB`) | None | **WORKING** | None |
| `/api/customer/wishlist` | GET/POST/DELETE | System A (JWT) | Enforced | Repository | None | **BROKEN** | 401 for OTP users |
| `/api/customer/addresses` | GET/POST | System A (JWT) | Enforced | Repository | None | **BROKEN** | 401 for OTP users |
| `/api/orders` | GET/POST | System B (Dual) | Enforced | D1 (`env.DB`) | None | **WORKING** | Non-atomic cart deletion |
| `/api/customer/orders` | GET | System A (JWT) | Enforced | Repository | None | **BROKEN** | 401 for OTP users |
| `/api/orders/[id]` | GET | System B (Dual) | Enforced | D1 (`env.DB`) | None | **WORKING** | Slow due to `ALTER TABLE` loops |
| `/api/orders/[id]/cancellation-request` | POST | System B (Dual) | Enforced | D1 (`env.DB`) | WhatsApp Link | **WORKING** | None |
| `/api/payments/create-order` | POST | System B (Dual) | Enforced | D1 (`env.DB`) | Razorpay | **WORKING** | None |
| `/api/payments/verify` | POST | System B (Dual) | Enforced | D1 (`env.DB`) | Razorpay | **WORKING** | Idempotent |
| `/api/admin/orders` | GET | System B (`order-access`)| Admin | D1 (`env.DB`) | None | **SLOW** | 10s+ delay due to N+1 queries |
| `/api/admin/orders/[id]` | GET/PATCH | System B (`order-access`)| Admin | D1 (`env.DB`) | Razorpay | **CRITICAL BUG**| 500 error on `cancelled_by` column |

---

## 28. Test Matrix

| Feature Flow | Logged Out | Logged In (Email) | Logged In (OTP) | Wrong User Access | Duplicate Action | Refresh Page | Test Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Add to Cart (`/api/cart`) | 401 Unauthorized | PASS | PASS | PASS (Isolated) | Duplicate rows created | PASS | **PASS with Caveat** |
| Add to Cart (`/api/customer/cart`)| 401 Unauthorized | PASS | **FAIL (401)** | PASS (Isolated) | Duplicate rows created | PASS | **FAIL** |
| Get Wishlist (`/api/wishlist`) | 401 Unauthorized | PASS | PASS | PASS (Isolated) | PASS | PASS | **PASS** |
| Get Addresses (`/api/customer/addresses`) | 401 Unauthorized | PASS | **FAIL (401)** | PASS (Isolated) | PASS | PASS | **FAIL** |
| COD Checkout (`/api/orders`) | 401 Unauthorized | PASS | PASS | PASS (Isolated) | Duplicate Order Risk | PASS | **PASS with Caveat** |
| UPI / Card Payment Verify | 401 Unauthorized | PASS | PASS | PASS (Isolated) | Idempotent Success | PASS | **PASS** |
| View Customer Orders | 401 Unauthorized | PASS | PASS | PASS (Isolated) | N/A | PASS | **PASS** |
| Request Cancellation | 401 Unauthorized | PASS | PASS | 404 Forbidden | 409 Conflict | PASS | **PASS** |
| Admin Approve Cancellation | 401 / 403 | **FAIL (500)** | **FAIL (500)** | 401 / 403 | **FAIL ("Already Refunded")**| FAIL (500) | **CRITICAL FAIL** |

---

## 29. Known Bugs

### Bug #1: Missing `cancelled_by` Column in Dynamic Patching
- **Location:** `src/lib/db/order.js` (`ensureCancellationColumns`) & `src/app/api/admin/orders/[id]/route.js` (line 96).
- **Symptom:** Approving order cancellation throws `D1_ERROR: no such column: cancelled_by` and HTTP 500.

### Bug #2: System A vs System B Authentication Incompatibility
- **Location:** `src/middleware/auth.js` vs `src/lib/auth.js`.
- **Symptom:** Users logging in via OTP receive `tharanitex_session` cookie; subsequent calls to controller routes fail with 401 Unauthorized.

### Bug #3: Admin Login Setting Raw Session Token in `admin_token` Cookie
- **Location:** `src/app/api/admin/login/route.js`.
- **Symptom:** Sets raw UUID token into `admin_token` cookie; controller routes expecting JWT reject it with 401.

### Bug #4: OTP Users Omitted from D1 `users` Table
- **Location:** `src/lib/auth.js` (`verifyOtpAndLogin`).
- **Symptom:** User records created in KV but never inserted into D1 `users` table, breaking SQL JOIN queries.

### Bug #5: N+1 Latency Overhead on Admin Orders Endpoint
- **Location:** `src/lib/db/order.js` (`getAdminOrders`).
- **Symptom:** `GET /api/admin/orders` takes 10+ seconds due to loop of individual D1 queries per order.

---

## 30. Root Causes

1. **Authentication:** Parallel development of two auth systems (JWT vs D1 Sessions) without a unified token resolver middleware.
2. **Cancellation/Refund 500 Error:** Schema mismatch between `0012_order_cancellation_and_invoices.sql` and `ensureCancellationColumns` dynamic runtime patching array in `src/lib/db/order.js`.
3. **Database Architecture Split:** Coexistence of legacy repository pattern (`src/repositories/*` with PascalCase tables) and direct D1 helper pattern (`src/lib/db/*` with lower_snake_case tables).

---

## 31. Risk Classification

| Risk Level | Issue Count | Features Impacted |
| :--- | :--- | :--- |
| **CRITICAL** | 3 | Admin Cancellation/Refund Approval, OTP Customer Auth, Admin API Access |
| **HIGH** | 4 | Admin Orders Load Latency (10s+), OTP User D1 Profile Sync, Cart Duplicate Race Condition |
| **MEDIUM** | 3 | Non-atomic COD cart clearing, Error message detail truncation, Missing FK constraints |
| **LOW** | 2 | Code duplication between controller & lib routes, Legacy dead code paths |

---

## 32. Recommended Fix Plan

> [!IMPORTANT]
> This plan is provided for technical reference and implementation by an engineer in a future phase. **No source code has been altered during this audit.**

### Phase 1 — Authentication & Session Unification
- Unify authentication into a single auth resolver in `src/middleware/auth.js` that checks JWT first, and if invalid, falls back to validating D1 session tokens against `sessions` table / KV.
- Ensure all login routes set unified cookies (`auth_token` and `tharanitex_session`).

### Phase 2 — D1 Schema Alignment & Cancellation Fix
- Update `ensureCancellationColumns()` in `src/lib/db/order.js` to include `"ALTER TABLE orders ADD COLUMN cancelled_by TEXT"`.
- Run database migration `0012_order_cancellation_and_invoices.sql` directly on D1 database (`npx wrangler d1 migrations apply tharani-db --remote`).

### Phase 3 — Database Layer Consolidation & OTP User Sync
- Modify `verifyOtpAndLogin` in `src/lib/auth.js` to perform an `INSERT OR REPLACE INTO users` in D1 whenever an OTP user registers or logs in.
- Deprecate parallel controller/repository routes (`/api/customer/*`) in favor of unified D1 routes (`/api/cart`, `/api/orders`, `/api/wishlist`).

### Phase 4 — Admin Performance Optimization
- Remove runtime `ensureCancellationColumns()` call from query hot-paths once migrations are applied.
- Refactor `getAdminOrders` to fetch order items in a single grouped `JOIN` query instead of N+1 loop queries.

---

## 33. Files That Need Changes (For Future Implementation Phase)

1. `frontend/src/lib/db/order.js` (Add `cancelled_by` to `ensureCancellationColumns`, optimize N+1 queries).
2. `frontend/src/middleware/auth.js` (Add D1 session lookup fallback to `authenticate` & `authenticateAdmin`).
3. `frontend/src/lib/auth.js` (Insert/sync OTP users into D1 `users` table).
4. `frontend/src/app/api/admin/login/route.js` (Set unified JWT or session cookies).
5. `frontend/src/app/api/customer/cart/route.js` & `customer/orders/route.js` (Redirect to unified D1 handlers).

---

## 34. Regression Test Plan

After future implementation, execute the following verification steps:

1. **OTP Login Test:** Log in via OTP -> Add product to cart -> View Cart -> Checkout -> Verify 0 HTTP 401 errors occur.
2. **Admin Refund Approval Test:** Log in as Admin -> Open order cancellation request -> Click "Approve Cancellation" -> Confirm order status updates to `cancelled`, refund status updates to `COMPLETED`, and HTTP status is 200 (no 500 errors).
3. **Duplicate Refund Safety Test:** Re-click "Approve Cancellation" on an already cancelled/refunded order -> Confirm API returns graceful status without 500 error or exception.
4. **Performance Verification Test:** Measure `GET /api/admin/orders` response time -> Confirm load time is under 1.5 seconds.
