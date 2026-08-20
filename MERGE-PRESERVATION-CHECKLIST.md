# MERGE PRESERVATION CHECKLIST — THARANI TEXTILES

This document itemizes every file changed in source branch `codex/linges-order-checkout-integration` relative to `main` and verifies its final preservation status.

---

## Source-Branch Changed Files & Preservation Audit

### 1. `frontend/src/controllers/AuthController.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** JWT signing, password verification, D1 session lookup
* **Main behavior preserved:** N/A (Main did not modify)
* **Source behavior preserved:** Complete customer auth controller
* **Verification:** Verified syntax and import bindings

### 2. `frontend/src/lib/auth.js`
* **Final status:** PRESERVED (TS -> JS)
* **Functional behavior preserved:** Cookie extraction, JWT verification helper
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Pure JavaScript auth library
* **Verification:** Verified import references across routes

### 3. `frontend/src/middleware/auth.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Route authorization guard for customer sessions
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Middleware request inspection
* **Verification:** Verified session cookie token extraction

### 4. `frontend/src/services/AuthService.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Registration, authentication, user data retrieval
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Business logic layer for user accounts
* **Verification:** Verified UserRepository calls

### 5. `frontend/src/app/api/auth/login/route.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Customer login endpoint & session cookie header
* **Main behavior preserved:** N/A
* **Source behavior preserved:** HTTP POST login handler
* **Verification:** Tested route response structure

### 6. `frontend/src/app/api/auth/profile/route.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Profile fetch & update handler
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Authenticated profile route
* **Verification:** Requires valid customer session

### 7. `frontend/src/app/api/auth/register/route.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** User registration route
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Account creation with password hashing
* **Verification:** Verified field validation logic

### 8. `frontend/src/lib/checkout-auth.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** `requireCustomer` guard returning authenticated customer
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Customer ownership enforcement helper
* **Verification:** Used in cart, wishlist, orders, and payment routes

### 9. `frontend/src/utils/jwt-secret.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** JWT secret retrieval for Web Crypto API
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Pure JS JWT secret helper
* **Verification:** Verified secret generation

### 10. `frontend/src/repositories/UserRepository.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** D1 user queries for authentication
* **Main behavior preserved:** N/A
* **Source behavior preserved:** User repository methods
* **Verification:** Verified D1 sql statement formatting

### 11. `frontend/src/app/admin/login/page.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Dedicated Admin Login Page UI
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Sign in form issuing `tharanitex_session`
* **Verification:** Redirects to `/admin` upon successful auth

### 12. `frontend/src/app/api/admin/login/route.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Admin authentication route setting session cookie
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Checks admin credentials & sets `tharanitex_session`
* **Verification:** Verified cookie expiration and security flags

### 13. `frontend/src/app/api/admin/logout/route.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Admin sign out endpoint
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Clears session cookie
* **Verification:** Returns success flag

### 14. `frontend/src/app/admin/layout.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Admin UI layout and privilege verification
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Guards admin navigation links
* **Verification:** Checked layout structure

### 15. `frontend/src/app/login/page.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Customer login UI
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Login form with OAuth & OTP
* **Verification:** Verified form submission flow

### 16. `frontend/src/app/profile/page.jsx`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Account details view
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Profile management page
* **Verification:** Tested page render

### 17. `frontend/src/app/api/auth/send-otp/route.js`
* **Final status:** PRESERVED (TS -> JS)
* **Functional behavior preserved:** Sends OTP code via SMS
* **Main behavior preserved:** N/A
* **Source behavior preserved:** OTP route conversion
* **Verification:** Verified sms lib import

### 18. `frontend/src/app/api/auth/verify-otp/route.js`
* **Final status:** PRESERVED (TS -> JS)
* **Functional behavior preserved:** Verifies customer OTP
* **Main behavior preserved:** N/A
* **Source behavior preserved:** OTP check logic
* **Verification:** Tested validation response

### 19. `frontend/src/lib/db.js`
* **Final status:** PRESERVED (TS -> JS)
* **Functional behavior preserved:** D1 database execution helper
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Pure JS db wrapper
* **Verification:** Verified query execution helper

### 20. `frontend/src/lib/db/cart.js`
* **Final status:** CONFLICT RESOLVED / MERGED
* **Functional behavior preserved:** Customer-isolated cart management with product variant support
* **Main behavior preserved:** Product variant queries and stock checks
* **Source behavior preserved:** `WHERE user_id = ?` scoping on update/delete
* **Verification:** Verified function signatures and SQL queries

### 21. `frontend/src/lib/db/order.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Order creation, status mutation, cancellation, and refund tracking
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Full order DB transaction functions
* **Verification:** Verified SQL bind parameters

### 22. `frontend/migrations/0015_razorpay_payment_tracking.sql`
* **Final status:** PRESERVED (Renumbered from 0011)
* **Functional behavior preserved:** Razorpay order ID and payment tracking columns
* **Main behavior preserved:** Retained Main's 0011 migration
* **Source behavior preserved:** Schema tracking for online payments
* **Verification:** Verified sequential migration numbering (0015)

### 23. `frontend/migrations/0016_order_cancellation_and_invoices.sql`
* **Final status:** PRESERVED (Renumbered from 0012)
* **Functional behavior preserved:** Cancellation request & invoice metadata columns
* **Main behavior preserved:** Retained Main's 0012 migration
* **Source behavior preserved:** Cancellation & invoice database schema
* **Verification:** Verified sequential migration numbering (0016)

### 24. `frontend/migrations/0017_order_refund_tracking.sql`
* **Final status:** PRESERVED (Renumbered from 0013)
* **Functional behavior preserved:** Order refund tracking table creation
* **Main behavior preserved:** Retained Main's 0013 migration
* **Source behavior preserved:** Refund logging database schema
* **Verification:** Verified sequential migration numbering (0017)

### 25. `frontend/migrations/0018_cart_wishlist_unique_constraints.sql`
* **Final status:** PRESERVED (Renumbered from 0014)
* **Functional behavior preserved:** Unique index constraints for cart and wishlist per customer
* **Main behavior preserved:** Retained Main's 0014 migration
* **Source behavior preserved:** Prevents duplicate rows in cart/wishlist
* **Verification:** Verified sequential migration numbering (0018)

### 26. `frontend/migrations/0019_order_cancellation_refund_columns.sql`
* **Final status:** PRESERVED (Renumbered from 0015)
* **Functional behavior preserved:** Additional cancellation reason & refund ID fields
* **Main behavior preserved:** Retained Main's 0014 product variants migration
* **Source behavior preserved:** Refund and cancellation state columns
* **Verification:** Verified sequential migration numbering (0019)

### 27. `frontend/src/app/api/cart/route.js`
* **Final status:** CONFLICT RESOLVED / MERGED
* **Functional behavior preserved:** Authenticated customer cart API supporting product variants
* **Main behavior preserved:** Received `variantId` parameter in POST request
* **Source behavior preserved:** Passed `requireCustomer(request, env)` for customer ownership
* **Verification:** Verified HTTP route response for GET, POST, PATCH, DELETE

### 28. `frontend/src/app/cart/page.jsx`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Customer cart page UI with order summary & checkout launch
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Cart item management view
* **Verification:** Tested component rendering

### 29. `frontend/src/components/Cart/CartItem.jsx`
* **Final status:** CONFLICT RESOLVED / MERGED
* **Functional behavior preserved:** Cart item card with optimistic updates and variant details
* **Main behavior preserved:** Displays variant name & SKU when present
* **Source behavior preserved:** Handles quantity change and remove triggers
* **Verification:** Verified props and change handlers

### 30. `frontend/src/components/Cart/OrderSummary.jsx`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Cart totals calculation & checkout modal trigger
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Order price summary box
* **Verification:** Verified price calculation logic

### 31. `frontend/src/app/api/wishlist/route.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Wishlist GET, POST, DELETE endpoints with customer ownership
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Account-isolated wishlist route
* **Verification:** Verified customer session checks

### 32. `frontend/src/app/wishlist/page.jsx`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Wishlist grid page UI
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Wishlist management UI
* **Verification:** Tested page render

### 33. `frontend/src/lib/checkout.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Server-side checkout validation and order payload preparation
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Validates product prices server-side
* **Verification:** Verified price & stock calculation logic

### 34. `frontend/src/components/Cart/CheckoutModal.jsx`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Multi-tab checkout modal (COD, UPI, Card, Razorpay)
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Handles payment verification & order creation
* **Verification:** Tested payment method switches and order completion callbacks

### 35. `frontend/src/lib/razorpay.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Razorpay signature verification and idempotent refund execution
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Server-side Razorpay SDK interaction
* **Verification:** Verified HMAC SHA256 signature verification

### 36. `frontend/src/app/api/payments/create-order/route.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Creates Razorpay payment order on server
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Returns Razorpay order ID
* **Verification:** Verified server-side price calculation

### 37. `frontend/src/app/api/payments/verify/route.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Verifies Razorpay payment signature & creates D1 order
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Validates signature before recording payment
* **Verification:** Verified HMAC verification check

### 38. `frontend/src/app/api/orders/route.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Customer orders API with `WHERE user_id = ?` scoping
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Order creation & list route
* **Verification:** Tested customer ownership filtering

### 39. `frontend/src/app/api/orders/[id]/route.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Single order detail API for customer
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Customer order retrieval with ownership check
* **Verification:** Verified `lib/order-access.js` guard

### 40. `frontend/src/app/orders/page.jsx`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Customer order history view
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Displays customer's orders list
* **Verification:** Tested page render

### 41. `frontend/src/app/orders/[id]/page.jsx`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Order tracking detail view with invoice download & cancellation request
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Order timeline and actions
* **Verification:** Verified component layout

### 42. `frontend/src/lib/order-access.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Verifies order ownership or admin authorization
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Core order security helper
* **Verification:** Verified user ID comparison against order record

### 43. `frontend/src/components/orders/OrderCard.jsx`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Order card component in history list
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Displays status pill and order items summary
* **Verification:** Verified status badge formatting

### 44. `frontend/src/app/api/orders/[id]/cancellation-request/route.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Customer order cancellation request API
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Records cancellation reason and updates order status
* **Verification:** Verified state checks before accepting cancellation request

### 45. `frontend/src/components/orders/CustomerOrderActions.jsx`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Cancellation request modal for customer
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Renders action buttons on order details page
* **Verification:** Tested modal state toggle

### 46. `frontend/src/app/api/orders/[id]/invoice/route.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** PDF invoice generation endpoint
* **Main behavior preserved:** N/A
* **Source behavior preserved:** PDF invoice download response
* **Verification:** Verified PDF header response

### 47. `frontend/src/app/admin/orders/page.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Master admin orders listing with filter tabs
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Full order access for authorized administrators
* **Verification:** Verified admin authorization check

### 48. `frontend/src/app/admin/orders/[id]/page.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Admin order details, cancellation approval, and refund trigger
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Order management panel for admin
* **Verification:** Verified status mutation and refund execution controls

### 49. `frontend/src/app/api/admin/orders/route.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Admin API route returning all store orders
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Admin order fetch
* **Verification:** Enforces admin session verification

### 50. `frontend/src/app/api/admin/orders/[id]/route.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Admin order status mutation & refund API
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Updates order status and processes Razorpay refund idempotently
* **Verification:** Tested refund idempotency logic

### 51. `frontend/src/app/admin/(root)/page.js`
* **Final status:** CONFLICT RESOLVED / MERGED
* **Functional behavior preserved:** Integrated admin dashboard with total revenue, total orders, active processing, cancellation requests, quick nav, and recent customer orders table
* **Main behavior preserved:** Placed under App Router route group `(root)`
* **Source behavior preserved:** Dynamic statistics and recent orders inspection table
* **Verification:** Tested dashboard metrics loading from `/api/admin/orders`

### 52. `frontend/src/app/admin/customerSection/page.jsx`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Admin customer directory UI
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Displays list of registered store customers
* **Verification:** Verified customer table rendering

### 53. `frontend/src/app/admin/products/page.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Admin product catalog list
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Displays product stock & management links
* **Verification:** Verified catalog grid render

### 54. `frontend/src/app/admin/settings/page.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Store settings & WhatsApp notification configuration UI
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Allows setting default WhatsApp admin number for cancellation alerts
* **Verification:** Tested setting update form

### 55. `frontend/src/app/api/products/route.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Public product catalog API with filtering
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Product list query
* **Verification:** Verified search and category parameters

### 56. `frontend/src/components/home/ProductSection/ProductCard.jsx`
* **Final status:** CONFLICT RESOLVED / MERGED
* **Functional behavior preserved:** Product card with styling from main and `router.refresh()` state updates from source
* **Main behavior preserved:** Image container ratio and hover zoom effects
* **Source behavior preserved:** `router.refresh()` on wishlist/cart toggle and `credentials: "include"`
* **Verification:** Verified image rendering and button action callbacks

### 57. `frontend/src/components/product/ProductDetails.jsx`
* **Final status:** CONFLICT RESOLVED / MERGED
* **Functional behavior preserved:** Detailed product page component with variant selector and Buy Now CheckoutModal
* **Main behavior preserved:** Variant buttons, variant pricing, variant stock validation
* **Source behavior preserved:** Buy Now button launching CheckoutModal directly (`checkoutType="BUY_NOW"`)
* **Verification:** Verified variant selection and Buy Now modal opening

### 58. `frontend/src/app/search/page.jsx`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Search results page UI
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Performs search query fetch and lists matching products
* **Verification:** Verified query string parsing

### 59. `frontend/src/app/home/page.jsx`
* **Final status:** CONFLICT RESOLVED / MERGED
* **Functional behavior preserved:** Homepage rendering with error-resilient DB fetch, `rowCount` support, and `<ConditionalFooter />`
* **Main behavior preserved:** Passed `rowCount` to ProductSection, added `<ConditionalFooter />`
* **Source behavior preserved:** Wrapped Cloudflare context in try-catch
* **Verification:** Verified home page render

### 60. `frontend/src/components/home/Categories/Categories.jsx`
* **Final status:** CONFLICT RESOLVED / MERGED
* **Functional behavior preserved:** Responsive category carousel slider
* **Main behavior preserved:** Mobile/tablet card width layout classes
* **Source behavior preserved:** Null checks for undefined categories array
* **Verification:** Verified category slider scrolling and rendering

### 61. `frontend/src/components/Footer/ConditionalFooter.jsx`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Hides footer on admin route paths
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Path inspection logic
* **Verification:** Tested path match against `/admin`

### 62. `frontend/src/components/ui/StatusBadge.js`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Color-coded status badge component
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Maps order status strings to color pills
* **Verification:** Verified rendering for `placed`, `confirmed`, `cancelled`, `refunded`

### 63. `frontend/src/components/home/Navbar/Navbar.jsx`
* **Final status:** PRESERVED
* **Functional behavior preserved:** Header navigation bar with search bar, authentication links, wishlist link, and cart link
* **Main behavior preserved:** Desktop/mobile search input styling
* **Source behavior preserved:** Mobile drawer drawer slide animation & header routing
* **Verification:** Tested search submit and mobile drawer toggling

### 64. `frontend/wrangler.jsonc`
* **Final status:** PRESERVED
* **Functional purpose:** Cloudflare D1 `DB` binding `tharani-db` & R2 bucket bindings
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Remote D1 configuration
* **Verification:** Verified D1 binding name `DB`

### 65. `frontend/next.config.mjs`
* **Final status:** PRESERVED (Converted from `.ts`)
* **Functional behavior preserved:** Next.js configuration module
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Pure JS ES module format
* **Verification:** Tested build command compatibility

### 66. `frontend/open-next.config.js`
* **Final status:** PRESERVED (Converted from `.ts`)
* **Functional behavior preserved:** OpenNext Cloudflare deployment config
* **Main behavior preserved:** N/A
* **Source behavior preserved:** Pure JS deployment config
* **Verification:** Tested build configuration

### 67. `frontend/src/lib/sms.js`
* **Final status:** PRESERVED (Converted from `.ts`)
* **Functional behavior preserved:** Sends SMS messages via SMS provider
* **Main behavior preserved:** N/A
* **Source behavior preserved:** SMS helper function
* **Verification:** Verified module export