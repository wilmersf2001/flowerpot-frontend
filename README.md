# Flowerpot — Frontend

Monorepo (Turborepo + npm) del frontend de **Flowerpot**, SaaS multi-tenant de
gestión de gimnasios en Perú. El backend (Laravel API REST) vive en otro repo.

> Estado: **M0 — andamiaje**. No hay lógica de negocio todavía.

## Estructura

```
apps/
  web/         Next.js público  — marketing, pricing, checkout (SEO, SSG/ISR)   :3000
  dashboard/   Next.js privado  — UNA app, DOS paneles según subdominio          :3001
                 admin.flowerpot.pe  -> route group (central)   [dueño del SaaS]
                 {gym}.flowerpot.pe  -> route group (tenant)    [cada gimnasio]
packages/
  ui/           design system: shadcn/ui + Tailwind v4 (Button, Input, Table, Toast)
  api-client/   instancia axios + interceptores (X-Tenant, manejo de 401)
  types/        tipos generados desde OpenAPI (openapi-typescript) — placeholder
  config/       tsconfig + ESLint + preset de Tailwind/PostCSS compartidos
```

### `apps/dashboard` — paneles por subdominio

`src/middleware.ts` es hoy un **esqueleto con TODOs** (M0). Cuando se implemente:
lee el subdominio, elige route group `(central)` / `(tenant)`, en `(tenant)`
setea la cookie `tenant=<slug>` (que `@repo/api-client` reenvía como `X-Tenant`),
y chequea la cookie `session` (httpOnly) para proteger rutas privadas.

## Scripts

```bash
npm install
npm run dev            # ambas apps (turbo)
npm run dev:web        # solo :3000
npm run dev:dashboard  # solo :3001
npm run build
npm run lint
npm run check-types
npm run gen:types      # regenera packages/types/src/api.d.ts (backend aún no expone Scramble)
```

## Config

Copia `apps/<app>/.env.local.example` a `apps/<app>/.env.local`:

```
NEXT_PUBLIC_API_URL=http://api.flowerpot.test/api
API_INTERNAL_URL=http://api.flowerpot.test/api
SESSION_COOKIE_NAME=session
ROOT_DOMAIN=flowerpot.pe
```

## Reglas del proyecto

- TypeScript estricto; `any` prohibido sin justificación inline.
- Sin Inertia; nada acoplado directamente a Laravel (todo pasa por `@repo/api-client`).
- El token de auth va SIEMPRE en cookie httpOnly, nunca en `localStorage`.
- Iconos: solo `lucide-react`, importados por nombre.
- Node >= 20, npm 10.

## Añadir componentes shadcn

shadcn está centralizado en `packages/ui`. Desde una app:

```bash
cd packages/ui && npx shadcn@latest add <componente>
```
