# MERGE INVENTORY — THARANI TEXTILES INTEGRATION

**Repository:** `gohut/tharanitex`  
**Source Branch:** `codex/linges-order-checkout-integration`  
**Target Branch:** `main`  
**Merge Base:** `2b007281f6ed8105a94e6441b2b7c0210b7faddb`

---

## 1. Authentication

### File: `frontend/src/controllers/AuthController.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Converted to JS, session handling, password hashing, JWT signing)
* **Functional purpose:** Handles customer authentication logic and token issuance
* **Risk:** High
* **Conflict:** No
* **Final decision:** Preserved source implementation with security validations
* **Reason:** Ensures secure customer authentication without hardcoded defaults

### File: `frontend/src/lib/auth.js`
* **Status:** Renamed from `.ts` to `.js` in Source
* **Changed by main:** No
* **Changed by source:** Yes (Converted TS to JS, cookie verification, JWT payload extraction)
* **Functional purpose:** Authentication library utilities for JWT and session cookies
* **Risk:** High
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** TS -> JS conversion with robust JWT verification

### File: `frontend/src/middleware/auth.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Next.js request authorization middleware)
* **Functional purpose:** Protects authenticated customer routes and API endpoints
* **Risk:** High
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Critical for preventing unauthorized access to customer APIs

### File: `frontend/src/services/AuthService.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Business logic layer for auth operations)
* **Functional purpose:** Coordinates user registration, login, and profile updates
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Maintains service abstraction for user authentication

### File: `frontend/src/app/api/auth/login/route.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Customer login endpoint with cookie setting)
* **Functional purpose:** Customer login API route
* **Risk:** High
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Authenticates customers and sets session HTTP-only cookies

### File: `frontend/src/app/api/auth/profile/route.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Customer profile fetch/update API)
* **Functional purpose:** Customer profile endpoint
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Allows authenticated customers to view and update profile info

### File: `frontend/src/app/api/auth/register/route.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Customer registration endpoint)
* **Functional purpose:** Customer registration route
* **Risk:** High
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Validates registration input and creates customer account in D1

### File: `frontend/src/lib/checkout-auth.js`
* **Status:** Added in Source
* **Changed by main:** No
* **Changed by source:** Yes (Checkout & Customer ownership guard `requireCustomer`)
* **Functional purpose:** Enforces customer authentication and returns authenticated user object
* **Risk:** Critical
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Core security requirement preventing guest/shared account leaks

### File: `frontend/src/utils/jwt-secret.js`
* **Status:** Added in Source
* **Changed by main:** No
* **Changed by source:** Yes (JWT secret manager)
* **Functional purpose:** Retrieves/generates JWT signing keys securely
* **Risk:** High
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Necessary for JWT signing/verification in Cloudflare Workers

### File: `frontend/src/repositories/UserRepository.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (D1 queries for user retrieval and creation)
* **Functional purpose:** Database access layer for user accounts
* **Risk:** High
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Interacts directly with D1 database for customer records

---

## 2. Admin Authentication

### File: `frontend/src/app/admin/login/page.js`
* **Status:** Added in Source
* **Changed by main:** No
* **Changed by source:** Yes (Dedicated Admin Login UI)
* **Functional purpose:** Standalone Admin login page
* **Risk:** High
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Prevents admin authentication collision with customer login

### File: `frontend/src/app/api/admin/login/route.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Admin authentication endpoint setting `tharanitex_session`)
* **Functional purpose:** Verifies admin credentials and sets admin session cookie
* **Risk:** Critical
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Enforces role-based admin login and cookie issuance

### File: `frontend/src/app/api/admin/logout/route.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Admin logout route clearing session)
* **Functional purpose:** Clears admin session cookies
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Secures admin exit flow

### File: `frontend/src/app/api/admin/auth/login/route.js`
* **Status:** Renamed from `.ts` to `.js` in Source
* **Changed by main:** No
* **Changed by source:** Yes (Admin auth API conversion)
* **Functional purpose:** Secondary admin auth endpoint
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** TS -> JS conversion

### File: `frontend/src/app/api/admin/auth/logout-all/route.js`
* **Status:** Renamed from `.ts` to `.js` in Source
* **Changed by main:** No
* **Changed by source:** Yes (Revoke all admin sessions)
* **Functional purpose:** Admin session revocation
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** TS -> JS conversion

### File: `frontend/src/app/admin/layout.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Admin layout with session check)
* **Functional purpose:** Wraps administrative views and verifies admin privileges
* **Risk:** High
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Ensures administrative section is guarded

---

## 3. Customer Sessions

### File: `frontend/src/app/login/page.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Customer login UI with Google OAuth & OTP support)
* **Functional purpose:** Main customer login view
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Provides seamless customer sign-in experience

### File: `frontend/src/app/profile/page.jsx`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Customer profile view with address & order links)
* **Functional purpose:** Customer account settings and profile overview
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Shows logged-in user profile details

---

## 4. OTP

### File: `frontend/src/app/api/auth/send-otp/route.js`
* **Status:** Renamed from `.ts` to `.js` in Source
* **Changed by main:** No
* **Changed by source:** Yes (Sends OTP to mobile number via SMS)
* **Functional purpose:** OTP generation and dispatch route
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Supports OTP authentication flow

### File: `frontend/src/app/api/auth/verify-otp/route.js`
* **Status:** Renamed from `.ts` to `.js` in Source
* **Changed by main:** No
* **Changed by source:** Yes (Verifies submitted OTP code)
* **Functional purpose:** OTP validation route
* **Risk:** High
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Confirms OTP validity before authorizing session

---

## 5. Database

### File: `frontend/src/lib/db.js`
* **Status:** Renamed from `.ts` to `.js` in Source
* **Changed by main:** No
* **Changed by source:** Yes (D1 helper utilities converted to JS)
* **Functional purpose:** Database connection helper
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Core DB execution helper

### File: `frontend/src/lib/db/cart.js`
* **Status:** Modified in both Main and Source
* **Changed by main:** Yes (Product variant support, stock checking for variants)
* **Changed by source:** Yes (Customer `user_id` ownership filtering on update & delete)
* **Functional purpose:** Cart database operations
* **Risk:** Critical
* **Conflict:** Yes (Merged)
* **Final decision:** Integrated both implementations
* **Reason:** Retains product variant checks from main AND customer security scoping from source

### File: `frontend/src/lib/db/home-data.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Homepage data queries)
* **Functional purpose:** Fetches hero, categories, banners, and showcase products
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Efficient homepage queries

### File: `frontend/src/lib/db/homepage.js`
* **Status:** Modified in Main
* **Changed by main:** Yes (Added rowCount support to showcase queries)
* **Changed by source:** No
* **Functional purpose:** Admin homepage CMS DB logic
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved main implementation
* **Reason:** Supports custom row count configuration in showcase sections

### File: `frontend/src/lib/db/order.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Order creation, status update, cancellation, refund tracking)
* **Functional purpose:** Order database access functions
* **Risk:** Critical
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Complete order transaction management and ownership logic

### File: `frontend/src/lib/db/product.js`
* **Status:** Modified in Main
* **Changed by main:** Yes (Product variant query helpers)
* **Changed by source:** No
* **Functional purpose:** Product catalog database functions
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved main implementation
* **Reason:** Fetches product variants and details

---

## 6. Migrations

### File: `frontend/migrations/0011_homepage_hero_mobile.sql`
* **Status:** Added in Main
* **Changed by main:** Yes
* **Changed by source:** No
* **Functional purpose:** Mobile hero images table columns
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved (Kept sequence index 0011)
* **Reason:** Database schema enhancement from main

### File: `frontend/migrations/0012_homepage_banner_mobile.sql`
* **Status:** Added in Main
* **Changed by main:** Yes
* **Changed by source:** No
* **Functional purpose:** Mobile banner images table columns
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved (Kept sequence index 0012)
* **Reason:** Database schema enhancement from main

### File: `frontend/migrations/0013_product_showcase_row_count.sql`
* **Status:** Added in Main
* **Changed by main:** Yes
* **Changed by source:** No
* **Functional purpose:** Showcase row count column
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved (Kept sequence index 0013)
* **Reason:** Database schema enhancement from main

### File: `frontend/migrations/0014_product_variants.sql`
* **Status:** Added in Main
* **Changed by main:** Yes
* **Changed by source:** No
* **Functional purpose:** Product variants schema
* **Risk:** High
* **Conflict:** No
* **Final decision:** Preserved (Kept sequence index 0014)
* **Reason:** Product variant table creation

### File: `frontend/migrations/0015_razorpay_payment_tracking.sql`
* **Status:** Renumbered from 0011 in Source
* **Changed by main:** No
* **Changed by source:** Yes (Razorpay payment tracking fields)
* **Functional purpose:** Payment tracking schema
* **Risk:** High
* **Conflict:** Resolved sequence collision
* **Final decision:** Preserved content under 0015 index
* **Reason:** Eliminates file numbering collision with main

### File: `frontend/migrations/0016_order_cancellation_and_invoices.sql`
* **Status:** Renumbered from 0012 in Source
* **Changed by main:** No
* **Changed by source:** Yes (Order cancellation & invoice tracking)
* **Functional purpose:** Cancellation & invoice schema
* **Risk:** High
* **Conflict:** Resolved sequence collision
* **Final decision:** Preserved content under 0016 index
* **Reason:** Sequential ordering

### File: `frontend/migrations/0017_order_refund_tracking.sql`
* **Status:** Renumbered from 0013 in Source
* **Changed by main:** No
* **Changed by source:** Yes (Refund tracking table)
* **Functional purpose:** Refund log schema
* **Risk:** High
* **Conflict:** Resolved sequence collision
* **Final decision:** Preserved content under 0017 index
* **Reason:** Sequential ordering

### File: `frontend/migrations/0018_cart_wishlist_unique_constraints.sql`
* **Status:** Renumbered from 0014 in Source
* **Changed by main:** No
* **Changed by source:** Yes (Unique index constraints for cart/wishlist per user)
* **Functional purpose:** Duplicate prevention schema
* **Risk:** High
* **Conflict:** Resolved sequence collision
* **Final decision:** Preserved content under 0018 index
* **Reason:** Sequential ordering

### File: `frontend/migrations/0019_order_cancellation_refund_columns.sql`
* **Status:** Renumbered from 0015 in Source
* **Changed by main:** No
* **Changed by source:** Yes (Cancellation reason & refund ID columns)
* **Functional purpose:** Order column additions
* **Risk:** High
* **Conflict:** Resolved sequence collision
* **Final decision:** Preserved content under 0019 index
* **Reason:** Sequential ordering

---

## 7. Cart

### File: `frontend/src/app/api/cart/route.js`
* **Status:** Modified in both Main and Source
* **Changed by main:** Yes (Added `variantId` parameter)
* **Changed by source:** Yes (Added `requireCustomer` ownership enforcement)
* **Functional purpose:** Cart API route
* **Risk:** Critical
* **Conflict:** Yes (Merged)
* **Final decision:** Merged both implementations
* **Reason:** Customer ownership security + product variant support

### File: `frontend/src/app/cart/page.jsx`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Cart view with item removal, quantity adjustment, and checkout trigger)
* **Functional purpose:** Customer cart page UI
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Complete cart UI flow

### File: `frontend/src/components/Cart/CartItem.jsx`
* **Status:** Modified in both Main and Source
* **Changed by main:** Yes (Variant display support)
* **Changed by source:** Yes (Optimistic update & delete actions)
* **Functional purpose:** Cart item card UI component
* **Risk:** Low
* **Conflict:** Yes (Merged)
* **Final decision:** Integrated variant display and cart action triggers
* **Reason:** Shows variant details and updates cart state seamlessly

### File: `frontend/src/components/Cart/OrderSummary.jsx`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Calculates totals, tax, shipping, and proceeds to checkout)
* **Functional purpose:** Order summary box in cart
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Accurate price calculation and checkout button

---

## 8. Wishlist

### File: `frontend/src/app/api/wishlist/route.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Wishlist API with `requireCustomer` ownership)
* **Functional purpose:** Wishlist CRUD endpoint
* **Risk:** High
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Customer-isolated wishlist management

### File: `frontend/src/app/wishlist/page.jsx`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Wishlist page UI with remove and move-to-cart actions)
* **Functional purpose:** Wishlist grid view
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Displays saved wishlist items for authenticated user

---

## 9. Checkout

### File: `frontend/src/lib/checkout.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Checkout validation and Razorpay order creation helper)
* **Functional purpose:** Server-side checkout logic
* **Risk:** Critical
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Verifies stock, item prices, and prepares payment payloads

### File: `frontend/src/components/Cart/CheckoutModal.jsx`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Multi-step checkout modal supporting COD, UPI, Card, Razorpay)
* **Functional purpose:** Primary customer checkout UI modal
* **Risk:** Critical
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Handles complete order checkout flow securely

---

## 10. Razorpay

### File: `frontend/src/lib/razorpay.js`
* **Status:** Added in Source
* **Changed by main:** No
* **Changed by source:** Yes (Razorpay SDK client, signature verification, refund execution)
* **Functional purpose:** Razorpay API integration library
* **Risk:** Critical
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Verifies HMAC signatures and handles online refunds idempotently

---

## 11. Payments

### File: `frontend/src/app/api/payments/create-order/route.js`
* **Status:** Added in Source
* **Changed by main:** No
* **Changed by source:** Yes (Creates Razorpay order ID on server)
* **Functional purpose:** Server-side payment initialization
* **Risk:** Critical
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Validates order total server-side before creating Razorpay order

### File: `frontend/src/app/api/payments/verify/route.js`
* **Status:** Added in Source
* **Changed by main:** No
* **Changed by source:** Yes (Verifies Razorpay payment signature & creates order in D1)
* **Functional purpose:** Server-side payment verification
* **Risk:** Critical
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Prevents payment forgery by verifying HMAC signature on server

---

## 12. Orders

### File: `frontend/src/app/api/orders/route.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Customer order listing & COD order creation)
* **Functional purpose:** Orders endpoint for customer
* **Risk:** Critical
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Enforces customer ownership (`WHERE user_id = ?`)

### File: `frontend/src/app/api/orders/[id]/route.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Single order detail route for customer)
* **Functional purpose:** Individual order detail API
* **Risk:** High
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Enforces customer ownership check (`lib/order-access.js`)

### File: `frontend/src/app/orders/page.jsx`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Customer order history page UI)
* **Functional purpose:** Customer orders overview page
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Displays order history for logged-in user

### File: `frontend/src/app/orders/[id]/page.jsx`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Customer order details & tracking page UI)
* **Functional purpose:** Detailed order view with status timeline
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Shows order items, status, invoice download, and cancellation button

### File: `frontend/src/lib/order-access.js`
* **Status:** Added in Source
* **Changed by main:** No
* **Changed by source:** Yes (Authorization helper for order access)
* **Functional purpose:** Validates if requester owns order or is authorized admin
* **Risk:** Critical
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Prevents cross-account data leaks for orders

### File: `frontend/src/components/orders/OrderCard.jsx`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Order item summary card component)
* **Functional purpose:** Displays order card in history list
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Shows status badges, item count, and date

---

## 13. Cancellation

### File: `frontend/src/app/api/orders/[id]/cancellation-request/route.js`
* **Status:** Added in Source
* **Changed by main:** No
* **Changed by source:** Yes (Customer order cancellation request API)
* **Functional purpose:** Endpoint for customers to request order cancellation
* **Risk:** High
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Validates order state before allowing cancellation request

### File: `frontend/src/components/orders/CustomerOrderActions.jsx`
* **Status:** Added in Source
* **Changed by main:** No
* **Changed by source:** Yes (Cancellation button & modal UI for customer)
* **Functional purpose:** Customer order action buttons
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Provides UI for requesting cancellation with reason input

---

## 14. Refunds

### File: `frontend/src/app/api/orders/[id]/invoice/route.js`
* **Status:** Added in Source
* **Changed by main:** No
* **Changed by source:** Yes (Generates & downloads PDF invoice for order)
* **Functional purpose:** Invoice download API
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Allows customers to download order invoices

---

## 15. Admin Orders

### File: `frontend/src/app/admin/orders/page.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Admin orders management page with filters & tabs)
* **Functional purpose:** Master order list for store administrators
* **Risk:** High
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Allows admin to filter, view, and process all store orders

### File: `frontend/src/app/admin/orders/[id]/page.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Admin order inspection, status change, cancellation approval/rejection, refund trigger)
* **Functional purpose:** Detailed admin order management view
* **Risk:** Critical
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Enables admin to approve cancellations and initiate Razorpay refunds idempotently

### File: `frontend/src/app/api/admin/orders/route.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Admin orders API returning all customer orders)
* **Functional purpose:** Admin orders list endpoint
* **Risk:** High
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Admin access to full store order history

### File: `frontend/src/app/api/admin/orders/[id]/route.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Admin order update endpoint handling status changes & refunds)
* **Functional purpose:** Admin order mutation API
* **Risk:** Critical
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Executes cancellation approval and Razorpay refund logic safely

---

## 16. Admin Dashboard

### File: `frontend/src/app/admin/(root)/page.js`
* **Status:** Modified in Main & updated with Source features
* **Changed by main:** Yes (Reorganized under route group `(root)`)
* **Changed by source:** Yes (Added live metrics, quick nav, and recent customer orders table)
* **Functional purpose:** Admin main dashboard view
* **Risk:** High
* **Conflict:** Yes (Merged)
* **Final decision:** Integrated source metrics and dashboard into main route group `(root)/page.js`
* **Reason:** Preserves Next.js route group architecture while keeping all administrative statistics

### File: `frontend/src/app/admin/(root)/loading.js`
* **Status:** Renamed from `admin/loading.js` in Main
* **Changed by main:** Yes
* **Changed by source:** No
* **Functional purpose:** Admin section loading spinner UI
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved main implementation
* **Reason:** Loading shell for admin route group

### File: `frontend/src/app/admin/customerSection/page.jsx`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Admin customer management directory UI)
* **Functional purpose:** Admin customer list view
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Allows admin to inspect customer accounts

### File: `frontend/src/app/admin/products/page.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Admin product inventory listing)
* **Functional purpose:** Product catalog management table
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Displays product stock and management controls

### File: `frontend/src/app/admin/products/add/page.js`
* **Status:** Modified in Main
* **Changed by main:** Yes (Product variant creation form)
* **Changed by source:** No
* **Functional purpose:** Add new product & variants page
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved main implementation
* **Reason:** Allows adding products with variant support

### File: `frontend/src/app/admin/content/page.js`
* **Status:** Modified in Main
* **Changed by main:** Yes (Hero & banner mobile image upload forms)
* **Changed by source:** No
* **Functional purpose:** Storefront CMS management page
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved main implementation
* **Reason:** Admin control over hero/banner images

### File: `frontend/src/app/admin/settings/page.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Store branding and WhatsApp notification settings)
* **Functional purpose:** Admin settings configuration
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Configures admin WhatsApp number for cancellation alerts

### File: `frontend/src/app/api/admin/products/route.js`
* **Status:** Modified in Main
* **Changed by main:** Yes (Supports product variant insertion)
* **Changed by source:** No
* **Functional purpose:** Admin product creation API
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved main implementation
* **Reason:** Creates products and variant records

### File: `frontend/src/app/api/admin/products/[id]/route.js`
* **Status:** Modified in Main
* **Changed by main:** Yes (Supports product variant updates)
* **Changed by source:** No
* **Functional purpose:** Admin product mutation API
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved main implementation
* **Reason:** Updates product and variant details

---

## 17. Products

### File: `frontend/src/app/api/products/route.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Product listing API with search & category filters)
* **Functional purpose:** Public product listing route
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Efficient product catalog queries

### File: `frontend/src/app/api/public/products/route.js`
* **Status:** Renamed from `.ts` to `.js` in Source
* **Changed by main:** No
* **Changed by source:** Yes (Public products API TS->JS conversion)
* **Functional purpose:** Public product fetch endpoint
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** TS -> JS conversion

### File: `frontend/src/app/api/public/products/[id]/route.js`
* **Status:** Renamed from `.ts` to `.js` in Source
* **Changed by main:** No
* **Changed by source:** Yes (Public product details API conversion)
* **Functional purpose:** Single product details fetch endpoint
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** TS -> JS conversion

### File: `frontend/src/app/product/[slug]/page.jsx`
* **Status:** Modified in Main
* **Changed by main:** Yes (Loads product variants from D1)
* **Changed by source:** No
* **Functional purpose:** Single product page view
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved main implementation
* **Reason:** Renders product details with variant support

### File: `frontend/src/components/home/ProductSection/ProductCard.jsx`
* **Status:** Modified in both Main and Source
* **Changed by main:** Yes (Image scaling & styling refinements)
* **Changed by source:** Yes (`router.refresh()`, credentials inclusion, guest userId removal)
* **Functional purpose:** Product card component on homepage and collections
* **Risk:** Medium
* **Conflict:** Yes (Merged)
* **Final decision:** Integrated styling from main with security and state refresh from source
* **Reason:** Correct visual rendering and instant cart/wishlist header counter updates

### File: `frontend/src/components/home/ProductSection/ProductSection.jsx`
* **Status:** Modified in Main
* **Changed by main:** Yes (Added rowCount grid layout styling)
* **Changed by source:** No
* **Functional purpose:** Homepage product section grid wrapper
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved main implementation
* **Reason:** Dynamic grid layout according to rowCount configuration

### File: `frontend/src/components/product/ProductDetails.jsx`
* **Status:** Modified in both Main and Source
* **Changed by main:** Yes (Variant selector UI and stock checks)
* **Changed by source:** Yes (Buy Now CheckoutModal integration)
* **Functional purpose:** Main product details interactive panel
* **Risk:** High
* **Conflict:** Yes (Merged)
* **Final decision:** Integrated variant selection and Buy Now checkout trigger
* **Reason:** Provides both variant options and direct purchase capability

---

## 18. Search

### File: `frontend/src/app/search/page.jsx`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Search page UI with live search results)
* **Functional purpose:** Search results page
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Displays search results matching query terms

---

## 19. Customer UI

### File: `frontend/src/app/home/page.jsx`
* **Status:** Modified in both Main and Source
* **Changed by main:** Yes (`rowCount` prop passing to ProductSection, `<ConditionalFooter />`)
* **Changed by source:** Yes (Safe `getCloudflareContext` error handling)
* **Functional purpose:** Main homepage layout
* **Risk:** High
* **Conflict:** Yes (Merged)
* **Final decision:** Combined safe Cloudflare DB retrieval with `rowCount` and `ConditionalFooter`
* **Reason:** Complete homepage rendering with error resilience

### File: `frontend/src/app/layout.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Global layout with toast notifications and metadata)
* **Functional purpose:** Root Next.js layout wrapper
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Establishes global styles and notifications

### File: `frontend/src/components/home/Categories/Categories.jsx`
* **Status:** Modified in both Main and Source
* **Changed by main:** Yes (Responsive category card width styling)
* **Changed by source:** Yes (Null safety checks)
* **Functional purpose:** Category showcase slider
* **Risk:** Medium
* **Conflict:** Yes (Merged)
* **Final decision:** Preserved responsive card styling from main and null checks from source
* **Reason:** Mobile category card layout fix

### File: `frontend/src/components/home/Hero/Hero.jsx`
* **Status:** Modified in Main
* **Changed by main:** Yes (Mobile hero image support)
* **Changed by source:** No
* **Functional purpose:** Main homepage hero banner carousel
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved main implementation
* **Reason:** Displays responsive hero slides for mobile and desktop

### File: `frontend/src/components/home/PromoBanner/PromoBanner.jsx`
* **Status:** Modified in Main
* **Changed by main:** Yes (Mobile banner image support)
* **Changed by source:** No
* **Functional purpose:** Promotional banner component
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved main implementation
* **Reason:** Renders responsive banner images

### File: `frontend/src/components/Footer/ConditionalFooter.jsx`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Renders footer except on admin routes)
* **Functional purpose:** Conditional footer wrapper
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Hides customer footer on admin portal views

### File: `frontend/src/components/ui/InitialLoadingShell.jsx`
* **Status:** Modified in both Main and Source
* **Changed by main:** Yes (Improved load event synchronization)
* **Changed by source:** Yes (Timer cleanup)
* **Functional purpose:** App loading screen shell
* **Risk:** Low
* **Conflict:** Yes (Merged)
* **Final decision:** Kept main load event synchronization
* **Reason:** Smooth transition from initial splash screen to content

### File: `frontend/src/components/ui/StatusBadge.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Color-coded order status pill component)
* **Functional purpose:** Status badge display
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Clear visual indicators for order status states

---

## 20. Navbar

### File: `frontend/src/components/home/Navbar/Navbar.jsx`
* **Status:** Modified in Source
* **Changed by main:** No (Main commits included prior navbar tweaks)
* **Changed by source:** Yes (Mobile drawer animation, auth links, cart/wishlist counters)
* **Functional purpose:** Top navigation bar component
* **Risk:** Critical
* **Conflict:** Inspected & Preserved
* **Final decision:** Preserved source implementation
* **Reason:** Complete responsive navigation with authentication, wishlist, and cart routing

---

## 21. Configuration

### File: `frontend/package.json` & `package-lock.json`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Dependencies and script definitions)
* **Functional purpose:** Node.js project manifest and dependency lockfile
* **Risk:** High
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Specifies build, dev, and Cloudflare deployment scripts

### File: `frontend/jsconfig.json`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (Configured `@/*` module alias path mapping for JS)
* **Functional purpose:** JavaScript path aliases configuration
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Supports root imports `@/...` after TS -> JS conversion

---

## 22. Cloudflare/OpenNext

### File: `frontend/wrangler.jsonc`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (D1 `DB` binding `tharani-db` & R2 bindings)
* **Functional purpose:** Cloudflare Workers configuration file
* **Risk:** Critical
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Configures production D1 database and R2 storage bindings

### File: `frontend/next.config.mjs`
* **Status:** Renamed from `next.config.ts` in Source
* **Changed by main:** No
* **Changed by source:** Yes (Converted to `.mjs`)
* **Functional purpose:** Next.js framework configuration
* **Risk:** High
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Pure JavaScript ES module configuration for Next.js

### File: `frontend/open-next.config.js`
* **Status:** Renamed from `open-next.config.ts` in Source
* **Changed by main:** No
* **Changed by source:** Yes (Converted to `.js`)
* **Functional purpose:** OpenNext Cloudflare deployment config
* **Risk:** High
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Prepares Next.js build for Cloudflare Workers runtime

---

## 23. R2

### File: `frontend/src/app/api/images/[...key]/route.js`
* **Status:** Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes (R2 asset proxy route)
* **Functional purpose:** Serves image files stored in Cloudflare R2 bucket
* **Risk:** Medium
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Serves product and uploaded banner images directly from R2

---

## 24. Notifications/SMS

### File: `frontend/src/lib/sms.js`
* **Status:** Renamed from `.ts` to `.js` in Source
* **Changed by main:** No
* **Changed by source:** Yes (SMS dispatch utility)
* **Functional purpose:** Sends SMS notification messages for orders and OTP
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** TS -> JS conversion

---

## 25. TypeScript → JavaScript Migration

### Files: `frontend/src/types/auth.js`, `products.js`, `reviews.js`, `settings.js`
* **Status:** Converted from `.ts` to `.js` files in Source
* **Changed by main:** No
* **Changed by source:** Yes
* **Functional purpose:** JSDoc / JS type definitions
* **Risk:** Low
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Eliminates TypeScript build dependency while retaining structure

---

## 26. Documentation

### Files: `ACCOUNT_ORDERS_IMPLEMENTATION_CHECKLIST.md`, `docs/account-order-flow-audit.md`, `INTEGRATION_LOG.txt`
* **Status:** Added/Modified in Source
* **Changed by main:** No
* **Changed by source:** Yes
* **Functional purpose:** Technical documentation & audit logs
* **Risk:** None
* **Conflict:** No
* **Final decision:** Preserved source implementation
* **Reason:** Documents feature architecture and integration steps

---

## 27. Renames / Deletions

### File: `frontend/src/app/admin/page.js`
* **Status:** Deleted in favor of `frontend/src/app/admin/(root)/page.js`
* **Changed by main:** Deleted
* **Changed by source:** Modified
* **Functional purpose:** Admin root page path
* **Risk:** Medium
* **Conflict:** Resolved
* **Final decision:** Consolidated into `frontend/src/app/admin/(root)/page.js`
* **Reason:** Prevents duplicate route definition error in Next.js App Router

---

## 28. Other

### File: `MERGE-INVENTORY.md`
* **Status:** Created
* **Functional purpose:** Comprehensive merge inventory record

### File: `MERGE-PRESERVATION-CHECKLIST.md`
* **Status:** Created
* **Functional purpose:** Itemized preservation checklist for all source branch changes