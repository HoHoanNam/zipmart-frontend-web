# Zipmart Frontend Web — Project Context & Coding Conventions

## Project Context

This repo is 1 of 5 sibling repos in the Zipmart system (`zipmart-frontend-web`,
`zipmart-admin-web`, `zipmart-mobile`, `zipmart-backend-nest`, `zipmart-backend-spring`).
This repo is the **customer-facing web app** — it talks only to
`zipmart-backend-nest` (the BFF/API Gateway), never directly to
`zipmart-backend-spring`. Auth is Bearer JWT in the `Authorization` header
(no cookies). All API calls target `/api/v1/...`.

Ports (local dev): **`frontend-web:4200`**, `admin-web:4300`, `backend-nest:3000`,
`backend-spring:8080`.

## Angular Coding Conventions

- **Standalone components only** — no `NgModule`. This project also has
  **no zone.js** (Angular 21 default) — change detection is fully
  signals-driven.
- State management: **Signals** (`signal`/`computed`), not NgRx. See
  `AuthService.currentUser`/`isAuthenticated`, `CartService.items`/`itemCount`.
- HTTP calls only through a `*.service.ts` — components never inject
  `HttpClient` directly.
- Guard: `authGuard` (`CanActivateFn`, `core/auth/auth.guard.ts`).
  Interceptor: `authInterceptor` (`HttpInterceptorFn`,
  `core/auth/auth.interceptor.ts`) — attaches `Authorization: Bearer` and
  silent-refreshes once on a 401 before retrying.
- File naming follows the Angular CLI **"2025" style guide**: `product-card.ts`
  / `.html`, not `product-card.component.ts` — this is what `ng generate`
  produces by default in this Angular version, not a deviation.
- Currency: always format prices through `VndCurrencyPipe`
  (`shared/pipes/vnd-currency.pipe.ts`) — never interpolate `product.price`
  directly, it's a raw numeric **string** from the backend (Postgres
  `numeric` columns serialize as strings) and will render an ugly
  `"199000.00"` if not passed through the pipe.
- Tailwind CSS v4 — **no `tailwind.config.js`** (CSS-first config via
  `@import 'tailwindcss'` in `styles.css`); don't add one, it's not needed at
  this version.

## Known constraint: recommendations require auth

`GET /recommendations` on `zipmart-backend-nest` is behind `JwtAuthGuard` —
there's no anonymous/guest recommendation endpoint. `Home` and
`ProductDetail` only render `<app-rec-widget>` when
`authService.isAuthenticated()` is true; guests see a "Đăng nhập để xem gợi ý"
prompt instead. Don't remove that check to "simplify" — it would just throw
401s for every guest visitor.

## Local Dev

- `environments/environment.development.ts` points at
  `http://localhost:3000/api/v1` (`zipmart-backend-nest` running locally via
  `npm run start:dev`, with its Postgres/Redis docker-compose up).
- `npm start` (`ng serve`) on port 4200.
- Cold-start recommendations return empty until there's real order history
  (`findTopSelling` in `backend-nest` queries `order_items`) — this is
  expected on a freshly-seeded database, not a bug.

## Current State

Full customer flow implemented and visually verified (Playwright screenshots)
against a locally running `zipmart-backend-nest` + seeded demo products:
register/login, product list with search, product detail with quantity
add-to-cart, cart with quantity/remove, mock checkout → order, order history,
behavior tracking (`view`/`click`/`add_to_cart`/`purchase` fired
fire-and-forget), and the recommendation widget with cold-start fallback UI.
Not yet implemented: full-text search UX beyond the plain `search` query
param (mirrors `backend-nest`'s current ILIKE search — will follow if/when
that upgrades to `tsvector`), and pagination beyond a simple 5-page number
strip.
