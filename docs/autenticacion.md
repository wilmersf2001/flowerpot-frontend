# Autenticación y paneles — cómo funciona Flowerpot

> Última actualización: 2026-09-04
> Este documento explica la idea general y qué está implementado hoy. Léelo antes
> de tocar el login o `proxy.ts`.

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
llamada `tenant`. El cliente HTTP (`@repo/api-client`) lee esa cookie y le manda
al backend la cabecera `X-Tenant: gymfit`, para que la API sepa de qué gimnasio
son los datos.

**El archivo que hace todo esto es `apps/dashboard/src/proxy.ts`.**
(En Next.js 16 el "middleware" se llama ahora "proxy"; es lo mismo: código que
corre antes de cada request.)

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

---

## 5. Qué está IMPLEMENTADO hoy ✅

**Solo el login del panel central (SaaS).** Funciona de punta a punta.

### Flujo actual

```
1. Abres cualquier ruta sin sesión
   → proxy.ts te manda a /login

2. Escribes correo + contraseña en /login
   → login-form.tsx hace POST a /api/auth/login

3. /api/auth/login (route handler del dashboard)
   → valida el formato con zod
   → hace POST http://localhost:8000/api/admin/login
   → si Laravel responde OK: guarda data.token en la cookie httpOnly "session"
   → si Laravel responde 422/401: devuelve el error para pintarlo en el form

4. El navegador ya tiene la cookie "session"
   → login-form.tsx te redirige a /tenants

5. /tenants está dentro de (central)/layout.tsx
   → se ve el menú: Gimnasios, Planes, Suscripciones, Configuración
   → y un botón "Cerrar sesión" abajo del sidebar

6. "Cerrar sesión" → POST /api/auth/logout
   → llama a POST /admin/logout en Laravel (best-effort)
   → borra la cookie "session"
   → te manda a /login
```

### Archivos que participan

| Archivo | Qué hace |
|---|---|
| `apps/dashboard/.env.local` | URLs de la API (`http://localhost:8000/api`) y nombre de la cookie. **No se sube a git.** |
| `apps/dashboard/src/lib/session.ts` | Nombre (`session`) y opciones de la cookie de sesión. |
| `apps/dashboard/src/app/api/auth/login/route.ts` | BFF de login: valida, llama a `/admin/login`, guarda el token en la cookie. |
| `apps/dashboard/src/app/api/auth/logout/route.ts` | BFF de logout: llama a `/admin/logout` y borra la cookie. |
| `apps/dashboard/src/app/login/page.tsx` | Página `/login` (server component, solo el marco). |
| `apps/dashboard/src/app/login/login-form.tsx` | El formulario en sí (client component: react-hook-form + zod). |
| `apps/dashboard/src/proxy.ts` | Guard: sin cookie `session` → `/login`; con cookie en `/login` → `/tenants`. |
| `apps/dashboard/src/components/logout-button.tsx` | Botón "Cerrar sesión". |
| `apps/dashboard/src/components/panel-shell.tsx` | Sidebar compartido; se le añadió un slot `footer` para el botón de logout. |
| `apps/dashboard/src/app/(central)/layout.tsx` | Pasa `<LogoutButton />` al `footer` del `PanelShell`. |

### Cómo probarlo hoy

1. Levantar el backend Laravel en `http://localhost:8000` con la ruta
   `/api/admin/login` y un usuario admin creado (seed).
2. `npm run dev:dashboard` (corre en el puerto **3001**).
3. Abrir `http://localhost:3001` → te redirige a `/login`.
4. Entrar con el usuario admin → caes en `/tenants` con el menú.

---

## 6. Qué FALTA ❌

### a) Que `proxy.ts` lea el subdominio

Hoy `proxy.ts` solo revisa la cookie de sesión. **No** mira el host, así que:

- No existe la separación `admin.` vs `gymfit.`.
- Solo hay un login (el del SaaS).
- Las páginas de ambos paneles conviven por ruta: central en `/tenants`,
  `/plans`…; tenant en `/members`, `/payments`… No hay una URL única "el panel
  central" ni "el panel del gimnasio".

Falta implementar en `proxy.ts`:

1. Sacar el subdominio de `host` usando `ROOT_DOMAIN`.
2. `admin` → panel central. Slug de gym → panel tenant + setear cookie `tenant`.
3. Apex / `www` / desconocido → redirigir al sitio de marketing.

### b) El login del panel tenant (gimnasio)

Cuando `proxy.ts` ya sepa distinguir el panel, falta:

| Pieza | Cambio |
|---|---|
| BFF `/api/auth/login` | Ramificar: si el panel es tenant → `POST /auth/login` con `X-Tenant`; si es central → `POST /admin/login` (lo actual). |
| Cookie de sesión | Una por panel (ej. `session` central y `tenant_session` tenant) para que estar logueado en uno no dé acceso al otro. |
| Guard en `proxy.ts` | En subdominio de gimnasio sin `tenant_session` → `/login`. |
| `(tenant)/layout.tsx` | Añadir `<LogoutButton />` (logout tenant → `POST /auth/logout`) y redirigir a `/members` tras login. |
| `@repo/api-client` | `readTenantFromContext()` y `handleUnauthorized()` hoy son *stubs* (no hacen nada). Implementarlos: leer la cookie `tenant`, y en respuesta 401 mandar a `/login`. |

### c) Mostrar quién está logueado

El backend **no** tiene endpoint `/admin/me` (solo `/auth/me`, que es del tenant).
Al recargar la página, del lado del SaaS solo tenemos el token, no el nombre.
Por eso el sidebar del panel central **no muestra** el nombre del admin todavía.
Si se quiere, al hacer login se puede guardar `name`/`email` en una cookie
legible aparte solo para pintarlos.

---

## 7. El problema práctico: subdominios en `localhost`

En tu computadora, `gymfit.flowerpot.pe` no apunta a nada. Opciones para probar
el ruteo por subdominio en local:

| Opción | Cómo | Ventaja / desventaja |
|---|---|---|
| **`*.localhost`** | Abrir `http://gymfit.localhost:3001` | Chrome y Firefox resuelven `*.localhost` a 127.0.0.1 sin configurar nada. `proxy.ts` tiene que recortar también `.localhost`. **La más simple.** |
| Editar `hosts` | Añadir `127.0.0.1 gymfit.flowerpot.test` al archivo hosts | Funciona pero hay que añadir cada gimnasio a mano. |
| dnsmasq / Valet | Comodín `*.flowerpot.test` → 127.0.0.1 | Cómodo pero requiere instalar y configurar. |
| Fallback de dev | Si el host no trae subdominio, leer `DEV_PANEL` / `DEV_TENANT` del `.env.local` | No necesita subdominios; solo sirve en local. |

---

## 8. Endpoints del backend (según los tipos generados)

| Método + ruta | Operación | Body | Respuesta | Uso |
|---|---|---|---|---|
| `POST /admin/login` | `adminAuth.login` | `{ email, password }` | `{ data: { user, token, token_type } }` | Login SaaS ✅ usado |
| `POST /admin/logout` | `adminAuth.logout` | — | `{ message, data: null }` | Logout SaaS ✅ usado |
| `POST /admin/register` | `adminAuth.register` | `UserRequest` | igual que login | Registro SaaS (no usado) |
| `POST /auth/login` | `auth.login` | `{ email, password }` | `{ data: { user, token, token_type } }` | Login tenant ❌ pendiente |
| `POST /auth/logout` | `auth.logout` | — | `{ message }` | Logout tenant ❌ pendiente |
| `GET /auth/me` | `auth.me` | — | `{ data: UserResource }` | Rehidratar sesión tenant ❌ pendiente |

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
