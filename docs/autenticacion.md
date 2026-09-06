# Autenticación y paneles — cómo funciona Flowerpot

> Última actualización: 2026-09-05
> Este documento explica la idea general y qué está implementado hoy. Léelo antes
> de tocar el login o `proxy.ts`.
> Para crear módulos CRUD (gimnasios, planes, socios…) sigue `docs/modulos.md`.

---

## 1. La idea en una frase

Hay **una sola aplicación** (`apps/dashboard`) que atiende a **dos tipos de
personas** distintas, y decide a quién mostrarle qué **según la dirección web**
por la que entras.

---

## 2. Los dos tipos de usuario

| Panel | Quién entra | Para qué | Route group en el código |
|---|---|---|---|
| **Central (SaaS)** | Tú, el dueño de Flowerpot | Administrar *todos* los gimnasios: crear gimnasios (tenants), planes, ver suscripciones | `src/app/(central)/` |
| **Tenant (gimnasio)** | El dueño / staff de cada gimnasio | Administrar *solo su* gimnasio: socios, membresías, pagos, caja, asistencia | `src/app/(tenant)/` |

No son dos webs separadas. Es el mismo programa con dos "puertas".

---

## 3. Cómo se decide qué panel abrir: el subdominio

Lo que va **antes** de `.flowerpot.pe` se llama **subdominio**. La app lo lee y
elige el panel:

| Entras por... | La app abre... |
|---|---|
| `admin.flowerpot.pe` | Panel central (SaaS) |
| `gymfit.flowerpot.pe` | Panel del gimnasio "GymFit" |
| `otrogym.flowerpot.pe` | Panel del gimnasio "OtroGym" |
| `flowerpot.pe` / `www.` / desconocido | Redirige al sitio de marketing (`apps/web`) |

Cuando entras a un gimnasio, la app guarda el slug (`gymfit`) en una cookie
legible `tenant`. El cliente HTTP (`@repo/api-client`) la lee para mandar
`X-Tenant: gymfit`, pero **la fuente de verdad es el BFF proxy** (§4.1): resuelve
el panel desde el host y añade `X-Tenant` y `Authorization` antes de llamar a
Laravel. Así el navegador nunca decide de qué gimnasio son los datos.

**El archivo que hace todo esto es `apps/dashboard/src/proxy.ts`**, apoyado en
`apps/dashboard/src/lib/domain.ts` (la función pura `resolvePanelFromHost`).
(En Next.js 16 el "middleware" se llama ahora "proxy"; es lo mismo: código que
corre antes de cada request.)

`proxy.ts` deja el panel resuelto en dos cabeceras de la request
(`x-panel`, `x-tenant-slug`) que los Server Components leen con
`lib/panel.ts` → `currentPanel()`.

---

## 4. El login

Los dos paneles usan **la misma ruta**: `/login`. Es el mismo formulario
(correo + contraseña). Lo único que cambia por debajo es **a qué endpoint del
backend le pregunta** si las credenciales son válidas:

| Entras por | Pantalla | El backend valida contra | Tras loguearte vas a |
|---|---|---|---|
| `admin.flowerpot.pe/login` | La misma `/login` | `POST /admin/login` | `/tenants` |
| `gymfit.flowerpot.pe/login` | La misma `/login` | `POST /auth/login` (+ `X-Tenant: gymfit`) | `/members` |

### Por qué el token no vive en el navegador (patrón BFF)

El backend (Laravel + Sanctum) devuelve un **token** cuando el login es correcto.
Ese token **no** se guarda en `localStorage` ni lo ve el JavaScript del navegador.
En su lugar:

1. El formulario manda correo/contraseña a un endpoint **de la propia app Next**
   (`/api/auth/login`), no directamente a Laravel.
2. Ese endpoint (el "BFF" — Backend For Frontend) llama a Laravel, recibe el
   token y lo guarda en una **cookie `httpOnly`** (invisible para el JS).
3. En cada request siguiente, el navegador manda esa cookie sola. `proxy.ts`
   solo comprueba que la cookie **exista** para dejarte pasar.

Ventaja: si hay un XSS, el atacante no puede robar el token porque el JS no
puede leerlo.

### 4.1 El BFF proxy para las llamadas de datos

El mismo problema del token aplica a **toda** llamada a la API, no solo al login:
la cookie httpOnly está en el host del dashboard (`admin.localhost:3001`), y el
navegador **no** la manda a `localhost:8000` (otro host).

Solución: el navegador nunca llama a Laravel directo. Llama a
**`/api/proxy/[...path]`** (mismo origen ⇒ la cookie viaja), y ese route handler
reenvía a `API_INTERNAL_URL` añadiendo:

- `Authorization: Bearer <token>` — leído de la cookie de sesión del panel.
- `X-Tenant: <slug>` — solo si el host es de un gimnasio (`resolvePanelFromHost`).

`@repo/api-client` apunta a `/api/proxy` vía `NEXT_PUBLIC_API_URL`, así que
`apiClient.get("/tenants")` termina en `/api/proxy/tenants` → Laravel `/tenants`.

```
navegador  ──fetch("/api/proxy/tenants")──▶  route handler  ──▶  API_INTERNAL_URL/tenants
  (cookie httpOnly del dashboard)              + Authorization: Bearer
                                               + X-Tenant (si es gimnasio)
```

Desde **Server Components** no se usa el proxy: se llama a Laravel con
`createApiClient({ baseURL: API_INTERNAL_URL, headers: { Authorization, "X-Tenant" } })`
tomando el token de la cookie y el slug de `currentPanel()`.

---

## 5. Qué está IMPLEMENTADO hoy ✅

**El ruteo por subdominio + los dos logins (central y tenant), de punta a punta.**

### Flujo actual

```
1. Abres una ruta (p. ej. gymfit.localhost:3001/members) sin sesión
   → proxy.ts resuelve el panel desde el host:
       admin.<ROOT_DOMAIN>  → central
       {gym}.<ROOT_DOMAIN>  → tenant, slug = "{gym}"
       sin subdominio       → central (o DEV_PANEL=tenant en .env.local)
   → deja x-panel / x-tenant-slug en la request + la cookie legible "tenant"
   → sin la cookie de sesión del panel → te manda a /login

2. Escribes correo + contraseña en /login
   → page.tsx pinta un diseño distinto según el panel (chip, textos)
   → login-form.tsx hace POST a /api/auth/login

3. /api/auth/login (BFF) mira el host y ramifica:
   → central: POST http://localhost:8000/api/admin/login
   → tenant : POST http://localhost:8000/api/auth/login  + X-Tenant: {gym}
   → si OK: guarda data.token en la cookie httpOnly del panel
       central → "session"        tenant → "tenant_session"
   → tenant: además refresca la cookie legible "tenant" con el slug
   → si 422/401: devuelve el error para pintarlo en el form

4. Ya con la cookie de sesión
   → login-form.tsx redirige: central → /tenants, tenant → /members
   → proxy.ts impide cruzar de panel (una ruta de gym en admin.* → rebote)

5. El layout del panel muestra el menú + botón "Cerrar sesión" abajo

6. "Cerrar sesión" → POST /api/auth/logout (también ramifica por host)
   → central: POST /admin/logout   tenant: POST /auth/logout + X-Tenant
   → borra la cookie de sesión del panel → te manda a /login
```

### Archivos que participan

| Archivo | Qué hace |
|---|---|
| `apps/dashboard/.env.local` | `NEXT_PUBLIC_API_URL=/api/proxy` (navegador), `API_INTERNAL_URL` (Laravel real, solo server), nombres de cookies, `ROOT_DOMAIN`, `DEV_PANEL`/`DEV_TENANT`. **No se sube a git.** |
| `apps/dashboard/src/app/api/proxy/[...path]/route.ts` | BFF proxy: reenvía las llamadas del navegador a Laravel con `Authorization: Bearer` + `X-Tenant` según el panel. |
| `apps/dashboard/src/lib/domain.ts` | `resolvePanelFromHost(host)`: host → `{ kind: "central" }` o `{ kind: "tenant", slug }`. Módulo puro (sin `next/headers`). |
| `apps/dashboard/src/lib/session.ts` | Cookies de sesión por panel (`SESSION_COOKIES`), cookie legible `tenant` y sus opciones. |
| `apps/dashboard/src/lib/panel.ts` | `currentPanel()`: lee `x-panel` / `x-tenant-slug` en un Server Component. |
| `apps/dashboard/src/proxy.ts` | Resuelve panel, propaga cabeceras, pone la cookie `tenant`, guard de sesión y anti-cruce de panel. |
| `apps/dashboard/src/app/api/auth/login/route.ts` | BFF de login: ramifica `/admin/login` vs `/auth/login` (+`X-Tenant`), guarda el token. |
| `apps/dashboard/src/app/api/auth/logout/route.ts` | BFF de logout: ramifica `/admin/logout` vs `/auth/logout`, borra la cookie. |
| `apps/dashboard/src/app/login/page.tsx` | Página `/login` (server): diseño + destino según panel. |
| `apps/dashboard/src/app/login/login-form.tsx` | El formulario (client: react-hook-form + zod); recibe `afterLoginPath`. |
| `apps/dashboard/src/components/logout-button.tsx` | Botón "Cerrar sesión" (sirve a los dos paneles). |
| `apps/dashboard/src/app/(central)/layout.tsx` · `(tenant)/layout.tsx` | Cada uno pasa `<LogoutButton />` al `footer` del `PanelShell`. |
| `packages/api-client/src/context.ts` | `readTenantFromContext()` lee la cookie `tenant` (navegador). `handleUnauthorized()` en un 401 hace `window.location.assign("/login")`. |

### Cómo probarlo hoy

Requiere `ROOT_DOMAIN=localhost` en `apps/dashboard/.env.local` (ya viene así).
**Reinicia `npm run dev:dashboard` tras cambiar el `.env.local`.**

1. Backend Laravel en `http://localhost:8000` con:
   - un admin seed (para `/api/admin/login`), y
   - un gimnasio con slug `gymfit` + un usuario suyo (para `/api/auth/login`
     con `X-Tenant: gymfit`).
2. `npm run dev:dashboard` (puerto **3001**).
3. **Panel central:** abre `http://admin.localhost:3001` → `/login` con el chip
   morado "Administración central" → entra con el admin → caes en `/tenants`.
4. **Panel del gimnasio:** abre `http://gymfit.localhost:3001` → `/login` con el
   chip verde "Gimnasio · gymfit" → entra con el usuario del gym → caes en
   `/members`. Las credenciales del admin **no** funcionan aquí (tabla distinta).
5. Sin subdominio (`http://localhost:3001`) se comporta como central; para probar
   tenant sin subdominio: `DEV_PANEL=tenant` + `DEV_TENANT=gymfit` y reinicia.

---

## 6. Qué FALTA ❌

### a) Helper para llamadas desde Server Components

El BFF proxy (§4.1) ya resuelve `Authorization` + `X-Tenant` para **todo** lo que
sale del navegador. Desde Server Components hay que armarlo a mano con
`createApiClient({ baseURL: API_INTERNAL_URL, headers })` (token de la cookie,
slug de `currentPanel()`). Falta un helper que encapsule ese patrón para no
repetirlo en cada módulo que haga fetch en el servidor.

### b) ~~`handleUnauthorized()` stub~~ ✅ hecho

En un 401, `@repo/api-client` hace `window.location.assign("/login")` (salvo que
ya estemos ahí o sea server). Pendiente menor: en el servidor el `ApiError` sube
y quien renderiza decide (aún no hay un `error.tsx` que lo capture).

### c) Redirección del sitio de marketing

El apex (`flowerpot.pe`, `www.`) hoy `proxy.ts` lo trata como panel central. En
producción, el DNS del apex debería apuntar a `apps/web` directamente; si por lo
que sea llega a esta app, faltaría un redirect a la URL de marketing.

### d) Mostrar quién está logueado

El backend **no** tiene endpoint `/admin/me` (solo `/auth/me`, que es del tenant).
Al recargar, del lado del SaaS solo tenemos el token, no el nombre. Por eso el
sidebar del panel central **no muestra** el nombre del admin. Si se quiere, al
hacer login se puede guardar `name`/`email` en una cookie legible aparte.

### e) Sesiones separadas pero mismo host en dev-fallback

Con subdominios (`admin.localhost` vs `gymfit.localhost`) las cookies ya están
aisladas por host. En el modo sin subdominio (`localhost:3001` + `DEV_PANEL`)
ambos paneles comparten host; funciona porque las cookies se llaman distinto
(`session` vs `tenant_session`), pero es solo para desarrollo.

---

## 7. Subdominios en `localhost` (ya resuelto para dev)

Con `ROOT_DOMAIN=localhost` en `.env.local`, `proxy.ts` recorta `.localhost` y
todo funciona abriendo `http://admin.localhost:3001` y
`http://gymfit.localhost:3001` (Chrome, Edge y Firefox resuelven `*.localhost` a
127.0.0.1 sin configurar nada). Alternativas si algún día hicieran falta:

| Opción | Cómo | Nota |
|---|---|---|
| **`*.localhost`** ← actual | Abrir `http://gymfit.localhost:3001` | Cero configuración. |
| Editar `hosts` | `127.0.0.1 gymfit.flowerpot.test` | Hay que añadir cada gym a mano. |
| dnsmasq / Valet | Comodín `*.flowerpot.test` → 127.0.0.1 | Requiere instalar/configurar. |
| `DEV_PANEL` / `DEV_TENANT` | En `.env.local`, cuando el host no trae subdominio | No necesita subdominios; solo dev. |

---

## 8. Endpoints del backend (según los tipos generados)

| Método + ruta | Operación | Body | Respuesta | Uso |
|---|---|---|---|---|
| `POST /admin/login` | `adminAuth.login` | `{ email, password }` | `{ data: { user, token, token_type } }` | Login SaaS ✅ usado |
| `POST /admin/logout` | `adminAuth.logout` | — | `{ message, data: null }` | Logout SaaS ✅ usado |
| `POST /admin/register` | `adminAuth.register` | `UserRequest` | igual que login | Registro SaaS (no usado) |
| `POST /auth/login` | `auth.login` | `{ email, password }` + `X-Tenant` | `{ data: { user, token, token_type } }` | Login tenant ✅ usado |
| `POST /auth/logout` | `auth.logout` | `X-Tenant` | `{ message }` | Logout tenant ✅ usado |
| `GET /auth/me` | `auth.me` | `X-Tenant` | `{ data: UserResource }` | Rehidratar sesión tenant ❌ pendiente |
| `GET /tenants` | `tenant.index` | — | lista de tenants (schema stub) | Módulo Gimnasios ✅ usado |
| `POST /tenants` | `tenant.store` | `{ id }` | `{ data: { tenant, admin_email, admin_password } }` | Crear gimnasio ✅ usado |
| `DELETE /tenants/{tenant}` | `tenant.destroy` | — | `{ status, message, data: null }` | Eliminar gimnasio ✅ usado |

Todas las de datos pasan por el **BFF proxy** `/api/proxy/[...path]` (§4.1).

Los tipos salen de `packages/types/src/api.d.ts`, que se regenera con
`npm run gen -w packages/types` (necesita el backend levantado en
`http://localhost:8000`).

---

## 9. Glosario rápido

- **Panel central / SaaS:** el back-office tuyo, para gestionar todos los gimnasios.
- **Tenant:** un gimnasio cliente. "Multi-tenant" = un sistema que sirve a muchos clientes aislados entre sí.
- **Subdominio:** la parte antes del dominio (`gymfit` en `gymfit.flowerpot.pe`).
- **Route group:** carpeta entre paréntesis en Next (`(central)`, `(tenant)`). Agrupa rutas sin cambiar la URL.
- **BFF (Backend For Frontend):** endpoints de la propia app Next que hablan con el backend real. Sirven para guardar el token en cookie httpOnly y no exponerlo al navegador.
- **Cookie httpOnly:** cookie que el JavaScript del navegador no puede leer. Solo viaja en las peticiones.
- **proxy.ts:** en Next 16, lo que antes era `middleware.ts`. Corre antes de cada request; aquí hará el ruteo por subdominio y el guard de sesión.
- **`X-Tenant`:** cabecera HTTP con el slug del gimnasio, para que el backend filtre los datos.
- **Sanctum:** el sistema de tokens de Laravel que usa este backend.
