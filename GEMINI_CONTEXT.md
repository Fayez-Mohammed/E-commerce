# WallsShop Furniture — Master Project Context for Gemini CLI

This document is the single source of truth for any future Gemini CLI sessions working on the **WallsShop Furniture** project. It contains business rules, backend API contracts, serialization quirks, project structure, state management, and conventions.

---

## 1. Project Overview & Identity

- **Product**: WallsShop Furniture (متجر وولز شوب للأثاث الفاخر).
- **Category**: Luxury Modern Architectural Furniture & Bespoke Home Decor.
- **Operating Market**: **Egypt (جمهورية مصر العربية - القاهرة)**.
- **Primary Showroom & Factory**: Cairo, Egypt (`القاهرة، جمهورية مصر العربية`).
- **Official Contact Phone**: `01027016323` (WhatsApp / Calls).
- **Official Contact Email**: `fayez00mohammed@gmail.com`.
- **Primary SuperAdmin**: `fayez00mohammed@gmail.com` (also supports `wallsshop@gmail.com`).
- **Currency**: **`ج.م`** (Arabic) / **`EGP`** (English).
- **Supported Languages**: Full Bilingual support with instant switching:
  - **Arabic (AR)**: Right-to-Left (`dir="rtl"`), typography using Google Font `Cairo`.
  - **English (EN)**: Left-to-Right (`dir="ltr"`), typography using Google Font `Plus Jakarta Sans`.

---

## 2. Workspace & Environment Rules

1. **Frontend Workspace (Editable)**:
   - Path: `D:\e-commerce`
   - All code, components, styles, tests, and configuration must reside here.
2. **Backend Project (READ-ONLY)**:
   - Path: `D:\repo\For the frontEnd\WallsShop`
   - **STRICT RULE**: The backend is completely finished and **READ-ONLY**. NEVER create, modify, delete, or refactor any backend files.
3. **Backend Host**:
   - Base URL: `https://localhost:7047`
4. **Frontend Dev Server & Proxy**:
   - Local URL: `http://localhost:3000`
   - `vite.config.ts` proxies `/api`, `/hubs`, and `/images` directly to `https://localhost:7047`.

---

## 3. Real Backend API Contracts & Response Quirks

### A. JSON Casing & Envelope Pattern
The ASP.NET Core backend JSON serializer defaults to **camelCase**, but some custom action results may return **PascalCase** or unwrapped arrays. Always unwrap responses safely:
```ts
const raw = res.data?.response ?? res.data?.Response ?? res.data?.reponse ?? res.data;
```

### B. Account Group Endpoints (`/api/Account/...`)

1. **`POST /api/Account/register`**
   - **Query**: `LanguageCode=ar` / `LanguageCode=en`
   - **Body**: `{ "email": "...", "password": "...", "phoneNumber": "...", "displayName": "..." }`
   - **Response**: `{ "response": "Registration successful...", "token": "..." }`
   - **Frontend**: Handled in [`src/services/authService.ts`](file:///D:/e-commerce/src/services/authService.ts#L95) & [`src/pages/auth/RegisterPage.tsx`](file:///D:/e-commerce/src/pages/auth/RegisterPage.tsx).

2. **`POST /api/Account/confirm-email`**
   - **Query**: `LanguageCode=ar` / `LanguageCode=en`
   - **Body**: `{ "email": "...", "token": "..." }`
   - **Response**: `{ "response": "Email verified!" }`
   - **Frontend**: Handled in [`src/services/authService.ts`](file:///D:/e-commerce/src/services/authService.ts#L100) & [`src/pages/auth/ConfirmEmailPage.tsx`](file:///D:/e-commerce/src/pages/auth/ConfirmEmailPage.tsx).

3. **`POST /api/Account/login`**
   - **Query**: `LanguageCode=ar` / `LanguageCode=en`
   - **Body**: Supports guest sync `{ "email": "...", "password": "...", "wishlist"?: { "productIds": [] }, "item"?: { "userId": "", "items": [...] } }`
   - **Response**: `{ "email": "...", "token": { "result": "eyJ...", "isCompleted": true, ... } }`
   - **Frontend**: Handled in [`src/services/authService.ts`](file:///D:/e-commerce/src/services/authService.ts#L29), [`src/stores/authStore.ts`](file:///D:/e-commerce/src/stores/authStore.ts) & [`src/pages/auth/LoginPage.tsx`](file:///D:/e-commerce/src/pages/auth/LoginPage.tsx).

4. **`POST /api/Account/logout`**
   - **Header**: `Authorization: Bearer <token>`
   - **Response**: `{ "response": "Logged out successfully" }`
   - **Frontend**: Handled in [`src/stores/authStore.ts`](file:///D:/e-commerce/src/stores/authStore.ts#L125).

5. **`GET /api/Account/user-info`**
   - **Header**: `Authorization: Bearer <token>`
   - **Response**: `{ "name": "...", "email": "...", "phoneNumber": "...", "role": ["User"] }`
   - **Frontend**: Handled in [`src/stores/authStore.ts`](file:///D:/e-commerce/src/stores/authStore.ts#L105).

6. **`PUT /api/Account/update-user-info`**
   - **Header**: `Authorization: Bearer <token>`
   - **Query**: `LanguageCode=ar` / `LanguageCode=en`
   - **Body**: `{ "email": "...", "name": "...", "phoneNumber": "..." }`
   - **Response**: `{ "response": "User information updated successfully" }`
   - **Frontend**: Handled in [`src/services/authService.ts`](file:///D:/e-commerce/src/services/authService.ts#L140) & [`src/pages/account/ProfilePage.tsx`](file:///D:/e-commerce/src/pages/account/ProfilePage.tsx#L52).

7. **`POST /api/Account/change-password`**
   - **Header**: `Authorization: Bearer <token>`
   - **Query**: `LanguageCode=ar` / `LanguageCode=en`
   - **Body**: `{ "oldPassword": "...", "newPassword": "...", "confirmNewPassword": "..." }`
   - **Response**: `{ "response": "Password updated successfully." }`
   - **Frontend**: Handled in [`src/services/authService.ts`](file:///D:/e-commerce/src/services/authService.ts#L144) & [`src/pages/account/ProfilePage.tsx`](file:///D:/e-commerce/src/pages/account/ProfilePage.tsx#L78).

8. **`POST /api/Account/forgot-password`**
   - **Query**: `LanguageCode=ar` / `LanguageCode=en`
   - **Body**: `{ "email": "..." }`
   - **Response**: `{ "response": "OTP sent to email.", "email": "..." }`
   - **Frontend**: Handled in [`src/services/authService.ts`](file:///D:/e-commerce/src/services/authService.ts#L108) & [`src/pages/auth/ForgotPasswordPage.tsx`](file:///D:/e-commerce/src/pages/auth/ForgotPasswordPage.tsx#L26).

9. **`POST /api/Account/verify-otp`**
   - **Query**: `LanguageCode=ar` / `LanguageCode=en`
   - **Body**: `{ "email": "...", "otp": "..." }`
   - **Response**: `{ "message": "OTP Verified.", "resetToken": "..." }`
   - **Frontend**: Handled in [`src/services/authService.ts`](file:///D:/e-commerce/src/services/authService.ts#L113) & [`src/pages/auth/ForgotPasswordPage.tsx`](file:///D:/e-commerce/src/pages/auth/ForgotPasswordPage.tsx#L43).

10. **`POST /api/Account/resend-otp`**
    - **Query**: `LanguageCode=ar` / `LanguageCode=en`
    - **Body**: `{ "email": "..." }`
    - **Response**: `{ "response": "A new OTP has been sent." }`
    - **Frontend**: Handled in [`src/services/authService.ts`](file:///D:/e-commerce/src/services/authService.ts#L125) & [`src/pages/auth/ForgotPasswordPage.tsx`](file:///D:/e-commerce/src/pages/auth/ForgotPasswordPage.tsx#L64).

11. **`POST /api/Account/reset-password`**
    - **Query**: `LanguageCode=ar` / `LanguageCode=en`
    - **Body**: `{ "token": "...", "email": "...", "newPassword": "...", "confirmPassword": "..." }`
    - **Response**: `{ "response": "Your password has been reset successfully." }`
    - **Frontend**: Handled in [`src/services/authService.ts`](file:///D:/e-commerce/src/services/authService.ts#L130) & [`src/pages/auth/ForgotPasswordPage.tsx`](file:///D:/e-commerce/src/pages/auth/ForgotPasswordPage.tsx#L77).

### C. Cart Group Endpoints (`/api/Cart/...`)

1. **`POST /api/Cart/add-item`**
   - **Header**: `Authorization: Bearer <token>`
   - **Body**: `CartItem` (`{ productId, variantId, productName, type, size, color, colorId, englishColor, unitPrice, originalPrice, quantity, imageUrl }`)
   - **Response**: `{ message: "Item added to cart successfully" }`
   - **Frontend**: Handled in [`src/stores/cartStore.ts`](file:///D:/e-commerce/src/stores/cartStore.ts#L130).

2. **`POST /api/Cart/get-cart`**
   - **Query**: `languageCode=ar` / `languageCode=en`
   - **Body**: `GetCartDto` (`{ userId: "", shoppingCart: { userId: "", items: [...] } }` for guest, `{}` for authenticated)
   - **Response**: `{ items: CartItem[], summary: { totalOriginalPrice, totalPrice, totalProductsCount, totalDiscount, count } }`
   - **Frontend**: Handled in [`src/stores/cartStore.ts`](file:///D:/e-commerce/src/stores/cartStore.ts#L67).

3. **`POST /api/Cart/get-Count-Of-cart`**
   - **Query**: `languageCode=ar` / `languageCode=en`
   - **Body**: `GetCartDto`
   - **Response**: `number` (total items count)
   - **Frontend**: Handled in [`src/stores/cartStore.ts`](file:///D:/e-commerce/src/stores/cartStore.ts#L106).

4. **`POST /api/Cart/update-quantity`**
   - **Header**: `Authorization: Bearer <token>`
   - **Query**: `languageCode=ar` / `languageCode=en`
   - **Body**: `{ productId, varianceId, quantity, colorId }`
   - **Response**: `{ items: CartItem[], summary: OrderSummaryDto }`
   - **Frontend**: Handled in [`src/stores/cartStore.ts`](file:///D:/e-commerce/src/stores/cartStore.ts#L173).

5. **`POST /api/Cart/Update-cart-items`**
   - **Query**: `languageCode=ar` / `languageCode=en`
   - **Body**: `GetCartDto`
   - **Response**: `{ items: CartItem[], summary: OrderSummaryDto }`
   - **Frontend**: Handled in [`src/stores/cartStore.ts`](file:///D:/e-commerce/src/stores/cartStore.ts#L248).

6. **`DELETE /api/Cart/delete-item`**
   - **Header**: `Authorization: Bearer <token>`
   - **Query**: `languageCode=ar` / `languageCode=en`
   - **Body**: `{ productId, varianceId, quantity: 0, colorId }`
   - **Response**: `{ items: CartItem[], summary: OrderSummaryDto }`
   - **Frontend**: Handled in [`src/stores/cartStore.ts`](file:///D:/e-commerce/src/stores/cartStore.ts#L209).

7. **`GET /api/Cart/CountOfItemsInCartForUser`**
   - **Header**: `Authorization: Bearer <token>`
   - **Response**: `{ Count: number }`
   - **Frontend**: Handled in [`src/stores/cartStore.ts`](file:///D:/e-commerce/src/stores/cartStore.ts#L109).

### D. Product Endpoints (`/api/Product/...`)
1. **Catalog Listing (`GET /api/Product/products`)**:
   - Query: `page`, `pageSize`, `category` (`categoryValue`), `search`, `order` (`price_asc`, `price_desc`, `rating_desc`, `latest_desc`), `LanguageCode`.
   - Response: `{ response: { data: ProductOverview[], totalPages: 102, currentPage: 1, categoryName: "All Categories" } }`.
2. **Single Product Detail (`GET /api/Product/product?id=1`)**:
   - Response: `{ response: { data: [ ProductDetail ] } }`.
   - Extract product from `raw.data[0]`.
3. **Related Products (`GET /api/Product/related-product?id=2&page=1&pageSize=4`)**:
   - Response: `{ response: { data: ProductOverview[] } }`.
4. **Top Recent Arrivals (`GET /api/Product/top-recent-product?page=1&pageSize=4`)**:
   - Response: `{ response: ProductOverview[] }` (direct array inside `response`).
5. **Top Rated Best Sellers (`GET /api/Product/top-rated-product?page=1&pageSize=4`)**:
   - Response: `{ response: ProductOverview[] }` (direct array inside `response`).

### D. Promotional Offers (`GET /api/Offers/get-offer`)
- Query: `languageCode=ar` or `languageCode=en`
- Response: Note backend key spelling `"reponse"`:
  ```json
  {
    "reponse": [
      {
        "id": 1,
        "name": "30% Discount Offer",
        "description": "Enjoy a limited-time 30% discount on selected products.",
        "categoryAR": null,
        "categoryEN": "Living-Room-&-TV-Units",
        "categoryValue": "Living-Room-&-TV-Units",
        "imageUrl": "https://newwallsshop.runasp.net/images/offers/...",
        "endDate": "2026-08-28"
      }
    ]
  }
  ```

### E. Categories (`GET /api/Category/categories`)
- Response: `{ response: [ { id: 1, category: "غرف المعيشة", categoryEn: "Living Room", categoryValue: "Living-Room-&-TV-Units", categoryImage: "..." } ] }`.

### F. SignalR Live Viewers Hub
- Endpoint: `/hubs/product-views`
- Connect via `@microsoft/signalr`.
- Call `.invoke('JoinProduct', productId)` on mount.
- Listen on `.on('ViewersUpdated', (count: number) => void)`.

### G. Admin Dashboard Endpoints (`/api/dashboard/DashBoard/...`)

1. **`GET /api/dashboard/DashBoard/summary`**: Returns `{ success: true, data: { totalProducts, totalCategories, totalOffers, totalUsers, totalOrders, totalSales } }`.
2. **`GET /api/dashboard/DashBoard/productsForDashboard`**: Returns `{ Response: PagedResult<ProductOverview> }` with pagination, category, search, and ordering.
3. **`GET /api/dashboard/DashBoard/GetProductForEdit?id=X`**: Returns `{ success: true, data: product }` with Arabic and English localized fields.
4. **`POST /api/dashboard/DashBoard/add-product`**: Expects `multipart/form-data` with `Product` (JSON string of `ProductAddDto0`) and `Images` (files array).
5. **`PUT /api/dashboard/DashBoard/update-product`**: Expects `multipart/form-data` with `Id`, `Product` (JSON string of `ProductUpdateDto`), `NewImages`, and `DeleteImageIds`.
6. **`DELETE /api/dashboard/DashBoard/delete-product?id=X`**: Deletes product and associated images.
7. **`GET /api/dashboard/DashBoard/GetAllOrders?LanguageCode=en`**: Returns list of all customer orders (`OrderDashboardDto[]`).
8. **`GET /api/dashboard/DashBoard/GetOrderDetails?id=X&LanguageCode=en`**: Returns full details and items for an order.
9. **`PUT /api/dashboard/DashBoard/ConfirmOrder?id=X`**: Sets order status to `"Confirmed"`.
10. **`PUT /api/dashboard/DashBoard/CancelOrder?id=X`**: Sets order status to `"Canceled"`.
11. **`DELETE /api/dashboard/DashBoard/Delete-Order?id=X`**: Deletes order record.
12. **`GET /api/dashboard/DashBoard/DownloadOrdersXml?LanguageCode=en`**: Exports all orders as an `application/xml` file download.
13. **`GET /api/dashboard/DashBoard/GetAllCustomers?LanguageCode=en`**: Returns list of customer accounts (`CustomerreturnDto[]`).
14. **`PUT /api/dashboard/DashBoard/BlockUser?userId=X`**: Sets user `isBlocked = true`.
15. **`PUT /api/dashboard/DashBoard/UnBlockUser?userId=X`**: Sets user `isBlocked = false`.
16. **`PUT /api/dashboard/DashBoard/ToggleBlock?userId=X`**: Toggles `isBlocked` and updates security stamp.
17. **`DELETE /api/dashboard/DashBoard/DeleteCustomer?id=X`**: Deletes customer account (prevented for `fayez00mohammed@gmail.com`).
18. **`POST /api/dashboard/DashBoard/AddAdmin`**: Restricted to `fayez00mohammed@gmail.com`. Creates new Admin user.

### H. Dashboard Promotional Offers Endpoints (`/api/dashboard/DashboardOffers/...`)

1. **`GET /api/dashboard/DashboardOffers/GetOffers`**: Returns list of all promotional offers (`{ success: true, data: DashboardOffer[] }`).
2. **`GET /api/dashboard/DashboardOffers/SpecificOffer?id=X`**: Returns details of a specific promotional offer (`{ success: true, data: DashboardOffer }`).
3. **`POST /api/dashboard/DashboardOffers`**: Expects `multipart/form-data` with:
   - `TitleAR`: string
   - `TitleEN`: string
   - `DescriptionAR`: string
   - `DescriptionEN`: string
   - `StartDate`: date string (`YYYY-MM-DD`)
   - `EndDate`: date string (`YYYY-MM-DD`)
   - `IsActive`: boolean string (`"true"` / `"false"`)
   - `CategoryValue`: string
   - `ImageUrlLink`: string (optional URL)
   - `ImageFile`: File (optional image upload)
4. **`PUT /api/dashboard/DashboardOffers/UpdateOffer?id=X`**: Expects `multipart/form-data` with the same fields as creation plus `id` query parameter.
5. **`DELETE /api/dashboard/DashboardOffers/DeleteOffer?id=X`**: Deletes the specified offer by ID.

### I. Customer Inquiry & Contact Form (`/api/Form/...`)
1. **`POST /api/Form/add-form`**: Receives `FormDto`:
   ```json
   {
     "name": "string",
     "email": "string",
     "address": "string",
     "message": "string",
     "phoneNumber": "string",
     "date": "2026-08-14"
   }
   ```
   Returns `{ message: "Form submitted successfully." }` (200 OK) or `{ message: "Failed to submit form. Please try again later." }` (400 Bad Request).

---

## 4. Frontend Architecture & Directory Tree

```
D:\e-commerce
├── public/
│   └── favicon.svg                  # Luxury gold 'W' geometric icon
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminLayout.tsx       # Admin sidebar, header, and role guard
│   │   ├── cart/
│   │   │   └── CartDrawer.tsx        # Slide-out interactive cart drawer
│   │   ├── common/
│   │   │   ├── Badge.tsx             # Semantic status & discount badges
│   │   │   ├── Button.tsx            # Fluid button with loading states
│   │   │   ├── Modal.tsx             # Accessible backdrop dialog
│   │   │   ├── Pagination.tsx        # Direction-aware pagination
│   │   │   ├── SkeletonLoader.tsx    # Card & list skeleton placeholders
│   │   │   ├── StarRating.tsx        # Interactive & display star rating
│   │   │   └── Toast.tsx             # Global toast provider & hook
│   │   ├── layout/
│   │   │   ├── Navbar.tsx            # Sticky header, search, counters, auth
│   │   │   ├── Footer.tsx            # Brand pillars, Egypt location, newsletter
│   │   │   └── ScrollToTop.tsx       # Smooth route scroll reset
│   │   └── product/
│   │       └── ProductCard.tsx       # Discount badge, rating, quick cart add
│   ├── hooks/
│   │   └── useSignalRViewer.ts       # SignalR live viewer hook
│   ├── i18n/
│   │   └── translations.ts           # Comprehensive Arabic & English dictionary
│   ├── pages/
│   │   ├── account/
│   │   │   ├── OrdersPage.tsx        # Customer order tracking timeline
│   │   │   └── ProfilePage.tsx       # Profile info and change password
│   │   ├── admin/
│   │   │   ├── AdminOverviewPage.tsx # KPI summary cards & recent orders
│   │   │   ├── AdminProductsPage.tsx # Product catalog & multipart CRUD modal
│   │   │   ├── AdminOrdersPage.tsx   # Order pipeline & XML export
│   │   │   ├── AdminCategoriesPage.tsx # Category CRUD
│   │   │   ├── AdminOffersPage.tsx   # Offers & campaigns CRUD
│   │   │   ├── AdminUsersPage.tsx    # Customer moderation & Add Admin modal
│   │   │   └── AdminReviewsPage.tsx  # Product review moderation
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx         # Login with cached cart/wishlist sync
│   │   │   ├── RegisterPage.tsx      # Sign up with email confirmation guide
│   │   │   ├── ConfirmEmailPage.tsx  # Token confirmation handler
│   │   │   └── ForgotPasswordPage.tsx # 3-step OTP recovery flow
│   │   └── storefront/
│   │       ├── HomePage.tsx          # Hero, multi-offer carousel, categories, arrivals
│   │       ├── ShopPage.tsx          # Catalog filtering, sorting, pagination
│   │       ├── ProductDetailsPage.tsx # Gallery, SignalR counter, variants, reviews
│   │       ├── WishlistPage.tsx      # Saved items grid
│   │       ├── CheckoutPage.tsx      # Shipping form & confetti celebration
│   │       └── ContactPage.tsx       # Showroom details & inquiry form
│   ├── services/
│   │   ├── adminService.ts           # Admin KPI, product CRUD, XML download
│   │   ├── api.ts                    # Central Axios client with token/lang interceptor
│   │   ├── authService.ts            # Login, register, OTP verification
│   │   ├── categoryService.ts        # Category retrieval
│   │   ├── contactService.ts         # Customer inquiry submission
│   │   ├── offerService.ts           # Multi-offer campaigns retrieval
│   │   ├── orderService.ts           # Checkout order creation
│   │   ├── productService.ts         # Catalog, single detail, related, top rated
│   │   └── reviewService.ts          # Reviews retrieval, submission & deletion
│   ├── stores/
│   │   ├── authStore.ts              # JWT decoder, session persistence, role state
│   │   ├── cartStore.ts              # Hybrid guest + server cart & drawer
│   │   ├── languageStore.ts          # Arabic/English & dir="rtl"/"ltr" HTML sync
│   │   └── wishlistStore.ts          # Hybrid guest + server wishlist
│   ├── styles/
│   │   └── variables.css             # Architectural Warm Minimalist design tokens
│   ├── types/
│   │   └── index.ts                  # All TypeScript domain interfaces & DTOs
│   ├── App.tsx                       # Full React Router tree
│   ├── index.css                     # Global CSS reset, typography, animations
│   ├── main.tsx                      # Root mounting
│   └── vite-env.d.ts                 # Asset and module declarations
├── index.html                        # Fonts (Cairo, Plus Jakarta Sans), SEO meta
├── package.json                      # Scripts & dependencies
├── tsconfig.app.json                 # TypeScript compiler setup & path aliases (@/*)
└── vite.config.ts                    # Vite config, path aliases, proxy rules
```

---

## 5. State Management & Storage Keys

- **Auth Session Storage**: `wallsshop-auth-session` / `wallsshop-token` / `wallsshop-user`.
- **Cart Storage**: `wallsshop-cart-storage` (persists guest cart across tabs).
- **Wishlist Storage**: `wallsshop-wishlist-storage` (persists guest wishlist product IDs).
- **Language Storage**: `wallsshop-language` (`'ar'` or `'en'`).

---

## 6. Design System Tokens (`src/styles/variables.css`)

- **Primary Colors**: Neutral Charcoal / Onyx (`#0C0A09` to `#F5F5F4`).
- **Accent Colors**: Warm Architectural Amber / Terracotta (`#D97706` / `#F59E0B` / `#78350F`).
- **Surfaces**: Alabaster, Warm Wood tint, Clean borders (`rgba(0,0,0,0.06)`).
- **Typography**:
  - Arabic: `'Cairo', system-ui, -apple-system, sans-serif`
  - English: `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif`
  - Display/Accents: `'Outfit', serif`
- **Transitions**: Smooth micro-interactions (`var(--transition-fast)`, `var(--transition-smooth)`).

---

## 7. Useful CLI Commands

```powershell
# Run local development server
npm run dev

# Run full TypeScript validation & production build
npm run build

# Preview production build
npm run preview
```
