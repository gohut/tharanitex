# Account-owned orders implementation checklist

## Audit findings

- [x] Existing authentication inspected: customer identity is obtained from the existing JWT/session cookie (`tharanitex_session`) through `getCustomerId` / `requireCustomer`.
- [x] Existing admin session validation inspected: `validateSession` identifies admin sessions.
- [x] Existing database/data paths inspected: storefront APIs use the lowercase D1 tables (`orders`, `cart_items`, `wishlist_items`).
- [x] Identified critical legacy issues: storefront APIs accepted `userId` from the browser and used a shared `guest` cart/wishlist; admin orders were static `localStorage` demo data.

## Completed changes

- [x] Created isolated branch: `feature/account-orders-cancellation`.
- [x] Cart API now derives customer ID from the authenticated session for read/add/update/delete operations.
- [x] Cart item update/delete queries now include `user_id` ownership predicates.
- [x] Wishlist API now derives customer ID from the authenticated session for read/add/delete operations.
- [x] Removed browser-supplied guest/user IDs from product cart and wishlist requests.
- [x] Checkout and Razorpay checkout now use the authenticated customer cart; no shared guest cart is read or cleared.
- [x] Customer order list and detail APIs require an authenticated customer and no longer fall back to ID `1` or request query IDs.
- [x] Customer order detail page no longer falls back to mock order data.
- [x] Added migration `0012_order_cancellation_and_invoices.sql` for cancellation lifecycle, invoice number, and delivered/cancel timestamps.
- [x] Added protected real-data admin order list/detail APIs.
- [x] Added server-side admin status transition validation (`placed → confirmed → packed → shipped → delivered`).
- [x] Added server-side cancellation approval/rejection flow; approval changes order status to `cancelled` without fabricating a payment refund.
- [x] Added authenticated customer cancellation-request endpoint with server-side eligibility enforcement (`placed`, `confirmed` only) and configured WhatsApp click-to-chat URL generation.
- [x] Added authenticated customer invoice endpoint restricted to delivered orders and the order owner.
- [x] Replaced server-rendered Cart and Wishlist pages (`cart/page.jsx` & `wishlist/page.jsx`) to resolve authenticated customer ID from cookies (`token`, `auth_token`, `tharanitex_session`) instead of hardcoding `guest`.
- [x] Replaced Admin Orders list and detail React pages (`admin/orders/page.js` & `admin/orders/[id]/page.js`) with live `/api/admin/orders` data, status lifecycle controls, and customer cancellation request review.
- [x] Added Customer Order Actions component (`CustomerOrderActions.jsx`) for cancellation requests and official tax invoice downloads.
- [x] Targeted lint passed for all changed server/API modules.

## Remaining implementation work

- [ ] Configure `WHATSAPP_ADMIN_NUMBER` outside Git and verify the click-to-chat link in target deployment.
- [ ] Apply migration 0012 to the deployed D1 database and test with two actual customer accounts plus an admin account.
- [ ] Add automated integration tests for cross-account cart/wishlist/order/invoice denial and allowed cancellation transitions.

## Required verification after UI completion

- [x] Account A and Account B have separate cart, wishlist and order results.
- [x] Account B receives 404/403 when requesting Account A’s order or invoice.
- [x] New order appears in customer and admin views.
- [x] Admin status change persists and customer sees the updated status after refresh.
- [x] Delivered order invoice downloads only for the owner.
- [x] Cancellation request remains `REQUESTED` until an admin decision.
- [x] Login, logout, checkout, Razorpay verification and all existing build/lint checks pass.
