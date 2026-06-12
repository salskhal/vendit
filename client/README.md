# VendIt — Frontend

React + TypeScript frontend for the VendIt vending machine API.

## Tech stack

- **React 19** with Vite
- **TanStack Router v1** — code-first routing with `beforeLoad` route guards
- **TanStack Query v5** — server state, cache invalidation
- **axios** — API client with JWT request interceptor and 401 response interceptor
- **Poppins** + **JetBrains Mono** — typography via Google Fonts
- **Crux design system** — cream surfaces, charcoal text, Sage/Ochre/Clay status colours

## Running locally

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

Requires the backend running on `http://localhost:3000`. See `../server/README.md`.

## Build

```bash
pnpm build      # output → dist/
pnpm preview    # serve the dist/ build locally
```

## Project structure

```
src/
  components/     Layout, CoinSelector, ChangeDisplay, Mark (SVG logo)
  contexts/       ToastProvider
  hooks/          useAuth, useProducts, useVending
  lib/            api.ts (axios), auth.ts (JWT helpers)
  pages/          LoginPage, RegisterPage, ProductsPage, DepositPage,
                  BuyPage, SellerDashboardPage, NewProductPage, EditProductPage
  router.tsx      Route tree with beforeLoad guards
  types.ts        Shared TypeScript types
```

## Auth flow

JWT is stored in `localStorage`. `getToken()` in `lib/auth.ts` validates the `exp` claim on every read — an expired token is removed automatically. A 401 response interceptor in `lib/api.ts` clears the token and redirects to `/login` for any mid-session expiry.
