# Tharani Textiles — Project Documentation (AI Onboarding Guide)

> Read this file first. It exists so that any AI assistant (or new developer) picking up
> this codebase understands the stack, the folder structure, how data flows from the
> database to the screen, and — most importantly — the currently **known, unfinished
> feature** (category card subtitle) so it isn't rediscovered from scratch or "fixed"
> incorrectly.

---

## 1. What this project is

**Tharani Textiles** is an e-commerce storefront + admin panel for a saree
(Indian textile) brand. It has:

- A public storefront: home page, product listing/search, product detail page,
  cart, wishlist, orders, login/profile.
- An admin panel (`/admin/**`) for managing products, categories, homepage
  content (hero slides, banners, "Why Tharani" section, category section),
  orders, customers, shipping, reviews, users/roles, and settings.

It is **not a static site** — it is a full Next.js app backed by a real
Cloudflare D1 (SQLite) database and Cloudflare R2 (object storage) for images,
deployed as a Cloudflare Worker.

---

## 2. Tech stack

| Layer            | Technology                                                                 |
|-------------------|-----------------------------------------------------------------------------|
| Framework         | Next.js 16 (App Router), React 19                                          |
| Styling           | Tailwind CSS 3 (utility classes only, no CSS Modules except a few legacy files) |
| Hosting/runtime   | Cloudflare Workers via **OpenNext** (`@opennextjs/cloudflare`)             |
| Database          | Cloudflare **D1** (SQLite) — accessed via `env.DB` (Cloudflare bindings)   |
| Object storage    | Cloudflare **R2** bucket `tharani-product-images` — accessed via `env.tharani_product_images` |
| KV                | A Cloudflare KV namespace is bound (`env.KV`) — not yet used anywhere in the code that was reviewed |
| Icons             | `lucide-react`, `react-icons`                                              |
| Toasts            | `react-hot-toast`                                                           |
| Fonts             | Local `.otf`/`.ttf` files + Google Font `Cormorant Garamond` (see §5)      |

**Important:** This is *not* deployed to Vercel despite the boilerplate
`README.md` still talking about Vercel — the real deploy pipeline is
`wrangler` + `opennextjs-cloudflare` (`npm run deploy`), targeting Cloudflare
Workers. `wrangler.jsonc` defines the bindings:

```jsonc
{
  "d1_databases": [{ "binding": "DB", "database_name": "tharani-db" }],
  "kv_namespaces": [{ "binding": "KV" }],
  "r2_buckets": [{ "bucket_name": "tharani-product-images", "binding": "tharani_product_images" }]
}
```

Every server-side route/page that touches the DB or R2 calls
`getCloudflareContext()` from `@opennextjs/cloudflare` to get `env`.

---

## 3. Folder structure (what lives where)

```
src/
  app/                      → Next.js App Router: pages + API routes
    page.js                 → re-exports "./home/page" (the real home page), force-dynamic
    home/page.jsx            → THE actual homepage. Fetches getHomeData() and renders
                               sections in admin-configured order (see §6)
    admin/                   → Admin panel pages (all client components, "use client")
      layout.js               → Sidebar/topbar shell + nav links
      page.js                 → Admin dashboard
      products/page.js        → Products AND Categories CRUD (tabbed UI) — see §7 for the bug
      products/add/page.js    → Add-product form
      content/page.js         → Homepage CMS: hero slides, banners, "Categories Section"
                                 title/subtitle (section-level only, NOT per-card), Why section,
                                 section ordering
      orders/, customers/, customerSection/, reviews/, shipping/, users/, settings/
    api/                      → Route handlers (REST-ish), all under /api
      admin/categories/…      → Category CRUD API (see §7)
      admin/homepage/…        → Hero slides / banners / settings / section-order API
      admin/products/…        → Product CRUD API
      admin/upload/…          → Generic image upload → R2, folder = products|categories|homepage
      images/[...key]/…       → Serves images back out of R2 (acts as a CDN proxy)
      home/route.js           → Public GET wrapper around getHomeData()
      products/, cart/, wishlist/, orders/ → Public-facing data APIs
    product/[slug]/, search/, cart/, wishlist/, orders/, profile/, login/ → public pages
    layout.js                 → ROOT LAYOUT (the one that's actually active — see §5 for the
                               font duplication gotcha), globals.css, Toaster, ScrollToTop,
                               MobileBottomNav, ConditionalFooter
    layout.jsx                 → UNRELATED: this is actually a `Loading` component, not a layout
                               (misleading filename — don't confuse with layout.js)
  components/
    home/
      Navbar/, Hero/, Categories/   → "Explore Elegance" category cards (§8 — the component
                                       these screenshots are about)
      PromoBanner/, ProductSection/, WhySection/, MobileBottomNav.jsx, SectionTitle/ (empty/unused)
    product/                  → Product detail page pieces (gallery, accordion, reviews, related)
    Cart/, orders/, Footer/, ui/ → Shared/reusable UI (Button, Modal, FormInput, Toggle, etc.)
  lib/
    db/                       → All D1 query functions, grouped by domain:
                                 category.js, product.js, homepage.js, home-data.js (aggregator),
                                 cart.js, customer.js, order.js, wishlist.js
    constants.js, theme.js
  data/                       → Static/mock JS data (legacy/seed-like, largely superseded by D1;
                               some pages may still import from here instead of the DB — check
                               before assuming a page is "live")
  fonts/                       → Local font files (Montserrat, CormorantInfant, Klaristha, Modern Romance)
  models/, utils/              → Currently EMPTY placeholder folders
public/assets/                 → Static images (logo, hero, categories, products, banners, backgrounds)
backup.sql                     → A D1 schema+data snapshot (see §9 — it is *older* than production;
                               it does not include the homepage_* tables that clearly exist live)
update_images.sql              → One-off manual data-fix script (product_images updates)
wrangler.jsonc                 → Cloudflare Worker/D1/R2/KV bindings + deploy config
next.config.ts, open-next.config.ts → Next.js + OpenNext build config
```

---

## 4. Data flow, end to end (how the homepage renders)

1. `src/app/home/page.jsx` (Server Component) calls `getCloudflareContext()` to
   get `env`, then calls `getHomeData(env.DB)` from `src/lib/db/home-data.js`.
2. `getHomeData` fan-outs to several DB helpers in parallel:
   - `getHeroSlides` / `getPromoBanners` / `getHomepageSettings` /
     `getHomepageSections` (all in `src/lib/db/homepage.js`)
   - `getAllCategories` (`src/lib/db/category.js`) → becomes `categories.items`
   - `getNewArrivalProducts` / `getBestSellerProducts` (`src/lib/db/product.js`)
3. `getHomepageSections` returns the **admin-configured list and order** of
   homepage sections (`homepage_sections` table: `section_type`,
   `reference_id`, `sort_order`, `is_active`). This is how the admin's
   "Content" page reordering / enabling / disabling of sections
   (hero, categories, banner, new_arrivals, best_sellers, why_tharani) takes
   effect — `home/page.jsx` just maps over this list and switches on
   `section.sectionType`.
4. Each section component receives its data as props and renders. The
   category cards section renders `<Categories categories={data.categories} />`.

The **admin panel** talks to the same tables through `/api/admin/**` route
handlers, which call the same `src/lib/db/*.js` functions used by the public
site (single source of truth — good pattern, keep following it).

---

## 5. Fonts — how they're wired, and a known duplication gotcha

Two different places define fonts, and only one of them is actually active:

- `src/app/layout.js` — **this is the real, active root layout** (used by
  Next.js because it's named exactly `layout.js` inside `src/app/`). It
  defines local fonts via `next/font/local` (Montserrat weights, Klaristha,
  Modern Romance, a `CormorantInfant-Light.otf` mapped to `--font-cormorant`)
  **and** the Google Font `Cormorant_Garamond` mapped to
  `--font-cormorant-garamond`. It puts all the CSS variables on `<html>` and
  sets the body's default font to Montserrat.
- `src/app/font.js` — a **second, separate, unused-by-layout** file that
  re-declares `klaristha`, `modernRomance`, `montserrat`, and `cormorant`
  (via `Cormorant_Garamond` from `next/font/google`, but exported as
  `cormorant`, not `cormorant-garamond`). Nothing currently imports this
  file into the active layout. It looks like a leftover from an earlier
  refactor. **Do not edit `font.js` expecting it to affect the live site** —
  edit the font blocks inside `src/app/layout.js` instead.
- `src/app/layout.jsx` is unrelated — despite the name, it's a `Loading`
  spinner component, not a layout.

**Cormorant Garamond specifically:**
- Tailwind's `fontFamily` config (`tailwind.config.js`) only registers
  `cormorant` (→ `var(--font-cormorant)`, which is actually the
  *CormorantInfant-Light.otf local file*, a different font family from
  Google's Cormorant Garamond) — it does **not** register a
  `font-cormorant-garamond` Tailwind utility.
- `src/app/globals.css` (around line 327) manually defines the utility class
  used throughout the category cards:
  ```css
  .font-cormorant-garamond {
    font-family: var(--font-cormorant-garamond), "Cormorant Garamond", serif;
  }
  ```
  This is why `className="font-cormorant-garamond"` works in
  `Categories.jsx` even though it's absent from `tailwind.config.js` — it's a
  hand-written CSS class, not a Tailwind-generated one. If you add more
  Cormorant Garamond usages elsewhere, reuse this exact class name (don't
  invent a new one, and don't rely on `font-cormorant`, which points at a
  different local font file).

---

## 6. Admin-driven homepage sections

`src/app/admin/content/page.js` is the CMS screen. It edits:
- Hero slides (image, title, subtitle, button text/link, order, active)
- Promo banners (image, title, subtitle, link, placement, order, active)
- **Homepage Settings** — flat key/value pairs stored in the
  `homepage_settings` table (`categories_title`, `categories_subtitle`,
  `why_title`, `why_heading`, `why_subtitle`, `why_features` as JSON). The
  "Categories Section" block in this admin page (search for `categoriesTitle`
  / `categoriesSubtitle`) controls the **section heading and the paragraph
  under it** ("Explore Elegance" / "Discover handcrafted sarees…") — it does
  **not** touch individual category cards.
- Section ordering/visibility (`homepage_sections` table via
  `/api/admin/homepage/sections`)

Individual category cards (name, image, slug, description, active) are
managed **separately**, on the **Products** admin page, under its
"Categories" tab (`src/app/admin/products/page.js`) — not on the Content
page. Keep this split in mind: "Categories Section" title/subtitle (Content
page) is a different concept from "a category card's own subtitle" (Products
page → Categories tab), which is the half-implemented feature described next.

---

## 7. ⚠️ KNOWN ISSUE: category card subtitle is half-implemented

This is what the two screenshots in the original request are showing:
Figma design has a small gold "SILKS" line under each category name
(THIRUBUVANAM / KANCHIPURAM / BANARAS), but the live site only shows the
name, no subtitle line.

The frontend component (`src/components/home/Categories/Categories.jsx`)
is **already built and ready** to show it:

```jsx
{item.subtitle && (
  <p className="font-cormorant-garamond mt-0.5 text-center text-[13px] uppercase leading-tight tracking-[0.04em] text-[#D4A437] sm:text-[14px] lg:text-[16px]">
    {item.subtitle}
  </p>
)}
```

But `item.subtitle` never arrives, because the feature was only wired up on
the client side of the admin form, not through the rest of the stack. Trace
of the break, layer by layer:

1. **Database schema** (`backup.sql`, `categories` table) has **no
   `subtitle` column** — only `id, name, slug, description, image_url,
   is_active, created_at`.
2. **`src/lib/db/category.js`** — `getAllCategories`, `getCategoryById`,
   `createCategory`, `updateCategory` all select/insert/update a fixed set of
   columns and **never mention `subtitle`**. Even if the column existed,
   these functions would silently drop it.
3. **API routes** `src/app/api/admin/categories/route.js` (POST) and
   `src/app/api/admin/categories/[id]/route.js` (PATCH) build the object
   passed into `createCategory`/`updateCategory` explicitly by field name
   (`name`, `slug`, `description`, `image`, `isActive`) — `body.subtitle` is
   never read or forwarded.
4. **Admin UI** `src/app/admin/products/page.js`:
   - The React state `catForm` **does** include a `subtitle` field —
     `openAddCat()` and `openEditCat()` both initialize
     `subtitle: c.subtitle || ""`.
   - But the actual "Add/Edit Category" modal (around line ~500 in that
     file) only renders inputs for **Category Name, Slug, Description, Image,
     Active** — there is **no `<FormInput>` for `subtitle`** in the modal.
     So even a user who knows the field exists in state has no UI to type
     into it.
5. **Public data flow** — `getAllCategories` output feeds directly into
   `categories.items` in `getHomeData()` (`src/lib/db/home-data.js`), which is
   what `Categories.jsx` receives as `item.subtitle`. Since step 1–3 never
   produce a `subtitle` value, `item.subtitle` is always `undefined`, so the
   `{item.subtitle && (...)}` block never renders on the live site.

**To finish this feature, all of the following need to change together**
(this is the checklist for whoever — human or AI — picks this up):

- [ ] Add a `subtitle TEXT` column to the `categories` table in D1 (a real
      migration against the live D1 database, not just `backup.sql`, since
      `backup.sql` is a stale local snapshot — see §9).
- [ ] `src/lib/db/category.js`: add `subtitle` to the `SELECT` list (aliased
      or as-is) in `getAllCategories`/`getCategoryById`, and to the
      `INSERT`/`UPDATE` statements + bound params in
      `createCategory`/`updateCategory`.
- [ ] `src/app/api/admin/categories/route.js` (POST): pass
      `subtitle: body.subtitle || ""` into `createCategory`.
- [ ] `src/app/api/admin/categories/[id]/route.js` (PATCH): pass
      `subtitle: body.subtitle || ""` into `updateCategory`.
- [ ] `src/app/admin/products/page.js`: add a `<FormInput label="Subtitle" ... />`
      (e.g. "Card subtitle (e.g. SILKS)") inside the Add/Edit Category modal,
      bound to `catForm.subtitle`, near the Description field. `catForm`
      state already supports it, so this is the only admin-UI change needed.
- [ ] No changes needed in `Categories.jsx` or `getHomeData` — they already
      support `item.subtitle` end to end.
- [ ] Update the 3 seeded categories (Silk Sarees / Cotton Sarees / Wedding
      Collection, or whatever the live D1 rows actually are) with subtitle
      values matching Figma (e.g. "SILKS") via the admin UI once shipped.

### Card visual styling — is it "exactly like Figma" already?

The current `Categories.jsx` styling already matches the Figma intent
reasonably closely (uppercase Cormorant Garamond name in dark gray
`#4A433C`, smaller uppercase Cormorant Garamond subtitle in gold `#D4A437`,
letter-spacing `0.04em`). Once the subtitle data actually flows through (see
checklist above), the visual gap between the live site and Figma should
close almost entirely without further CSS changes. If a pixel-level diff
against Figma is still needed afterward, compare:
- Name font-size/weight: Figma uses a slightly heavier/larger serif for the
  category name than the current `font-medium text-[22px]…text-[27px]`.
- Vertical gap between image and text block, and between name and subtitle
  (currently `pt-3`/`mt-0.5`) — nudge these `px`/`rem` values against the
  Figma spec if a designer hands over exact numbers.

---

## 8. The `Categories` component contract (for future edits)

`src/components/home/Categories/Categories.jsx` expects:

```ts
categories: {
  title: string;        // section heading, e.g. "Explore Elegance"
  subtitle?: string;     // section paragraph under the heading
  items: Array<{
    id: number|string;
    name: string;        // card title, e.g. "Thirubuvanam"
    slug: string;         // used to build /search?category=<slug>
    image: string;        // card image URL (R2-served via /api/images/... or /public/assets/...)
    subtitle?: string;     // NOT YET POPULATED — see §7. e.g. "Silks"
  }>;
}
```
It renders nothing if `categories` is falsy or `items` is empty (safe against
missing data). Clicking a card links to `/search?category=<slug>`.

---

## 9. Database notes

- `backup.sql` in the repo root is a **point-in-time dump** taken
  2026-07-31 and only contains: `categories`, `products`, `product_images`,
  `users`, `addresses`, `wishlist`, `cart`, `orders`, `order_items`. It does
  **not** contain `homepage_hero_slides`, `homepage_banners`,
  `homepage_settings`, or `homepage_sections` — all four of which are
  clearly used by live code (`src/lib/db/homepage.js`) and must exist in the
  real D1 database. **Treat `backup.sql` as historical/reference only, not
  as the authoritative current schema** — don't regenerate types or write
  migrations assuming it's complete; check the live D1 database (via
  `wrangler d1 execute` or the Cloudflare dashboard) first.
- `update_images.sql` is a one-off manual fix script for `product_images`
  rows, not a repeatable migration.
- No formal migrations folder exists in this zip (the two `d1_migrations`
  rows in `backup.sql`, `0001_initial_schema.sql` and `0002_seed_data.sql`,
  reference migration files that weren't included in this export). Any
  schema change (like the `subtitle` column in §7) needs a new migration
  applied directly against the D1 database, in whatever way this project's
  deploy process expects (check for a `migrations/` folder in the full repo,
  or apply via `wrangler d1 migrations create` / `wrangler d1 execute`).

---

## 10. Images

Two image sources coexist:
- `public/assets/**` — static images bundled with the app (logo, hero
  banners, category fallback images, product photos used in seed data).
- Cloudflare R2 bucket `tharani-product-images` — images uploaded through
  the admin panel (`/api/admin/upload`, folders: `products`, `categories`,
  `homepage`) and served back out through `/api/images/[...key]` (which
  proxies R2 objects with long-lived cache headers). Any `image_url`/`image`
  value starting with `/api/images/` refers to an R2 object; anything else is
  likely a static `/assets/...` path.

---

## 11. Quick pointers for common tasks

- **Change home page section order/visibility** → Admin → Content page →
  section ordering UI → writes to `homepage_sections` via
  `/api/admin/homepage/sections`.
- **Change "Explore Elegance" heading/paragraph** → Admin → Content →
  "Categories Section" fields → `homepage_settings` (`categories_title`,
  `categories_subtitle`).
- **Change an individual category card's name/image/slug** → Admin →
  Products → Categories tab → Add/Edit Category modal → `categories` table.
- **Add the missing per-card subtitle ("SILKS" text)** → see the full
  checklist in §7.
- **Add/adjust a font** → declare it in `src/app/layout.js` (the active
  layout), expose it as a CSS variable there, then either add it to
  `tailwind.config.js` `theme.extend.fontFamily`, or hand-write a
  `.font-*` utility class in `src/app/globals.css` the way
  `.font-cormorant-garamond` was done. Don't edit `src/app/font.js` expecting
  it to matter — it isn't imported by the active layout.
- **Add a new homepage section type** → add a case in the `switch` inside
  `src/app/home/page.jsx`'s `renderSection`, plus admin support in
  `src/app/admin/content/page.js` if it needs configurable content.

---

## 12. Things that look unfinished/inconsistent (worth knowing about, not necessarily urgent)

- `src/app/font.js` — orphaned, not imported anywhere active (see §5).
- `src/app/layout.jsx` — misleadingly named; it's a loading spinner, not a
  layout. Consider renaming to `loading-fallback.jsx` or similar to avoid
  future confusion (there's already a proper `src/app/loading.jsx`).
- `src/components/home/SectionTitle/SectionTitle.jsx` — empty file, unused.
- `src/data/*.js` — a parallel set of static/mock data files
  (`products.js`, `homeContent.js`, `hero.js`, etc.) that look like an early
  pre-D1 version of the content. Confirm whether any live page still imports
  from `src/data/` before assuming everything is D1-backed.
- `src/models/`, `src/utils/` — empty placeholder folders, presumably
  reserved for future use.
- Category subtitle feature — see §7, the main actionable item.
