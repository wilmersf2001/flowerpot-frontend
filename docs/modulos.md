# Cómo se arma un módulo del dashboard

> Última actualización: 2026-09-05
> Módulo de referencia: **Gimnasios** (`apps/dashboard/src/features/tenants/`).
> Para clonar y hacer uno nuevo, ve directo al §7 (checklist).

---

## 1. Idea en una frase

Cada pantalla de recurso (Gimnasios, Planes, Socios, Pagos…) es un **feature**
autocontenido en `src/features/<nombre>/`. Dentro hay una separación fija:

```
lib/         → lógica pura y datos (API, tipos, schema, hooks, keys, constantes)
components/   → piezas de UI del módulo (tabla, diálogos, formularios)
<nombre>-page.tsx → orquesta todo; es lo único que importa la ruta
index.ts     → API pública del módulo (lo que otros pueden importar)
```

La ruta de Next (`src/app/(central)/tenants/page.tsx`) queda en 3 líneas: solo
renderiza `<TenantsPage />`.

---

## 2. Las capas (de abajo hacia arriba)

| Capa | Archivo(s) | Puede importar | NO importa |
|---|---|---|---|
| HTTP | `@repo/api-client` (`apiClient`) | — | — |
| Datos | `lib/*.api.ts` | `apiClient`, tipos, constantes | React, componentes |
| Estado servidor | `lib/*.hooks.ts` + `lib/*.keys.ts` | `*.api.ts`, `@tanstack/react-query` | componentes |
| Validación | `lib/*.schema.ts` | `zod`, constantes | React |
| UI del módulo | `components/*` | hooks, schema, `@repo/ui`, `@/features/_shared` | otro feature |
| Pantalla | `<nombre>-page.tsx` | todo lo anterior del propio módulo | — |

Regla de oro: **un `components/` nunca llama a `apiClient` directo** — pasa por un
hook de `lib/`.

---

## 3. Los archivos de `lib/`

Tomando `tenants` como ejemplo:

### `tenants.constants.ts`
Valores fijos: el endpoint, patrones de validación, opciones de selects.
```ts
export const TENANTS_ENDPOINT = "/tenants";
export const TENANT_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
```

### `tenants.types.ts`
Los tipos del recurso. **Preferir los generados** de `@repo/types`
(`components["schemas"]["..."]`). Si el backend aún no los anota, se escriben a
mano con un `// TODO(gen)` y se reemplazan al correr `npm run gen -w packages/types`.
```ts
export interface CreateTenantInput { id: string }
export interface TenantRow { id: string; created_at?: string; [k: string]: unknown }
```

### `tenants.schema.ts`
El `zod` del formulario. Espeja las reglas del `FormRequest` de Laravel.
Mensajes de error en español.
```ts
export const createTenantSchema = z.object({ id: z.string().min(1, "…").regex(TENANT_ID_PATTERN, "…") });
export type CreateTenantForm = z.infer<typeof createTenantSchema>;
```

### `tenants.api.ts`
Funciones que llaman a `apiClient`. Una por operación. Devuelven datos ya
"desenvueltos" (sin el sobre `{ data: ... }` de Laravel). Nada de React aquí.
```ts
export const tenantsApi = { list, create, remove };
```

### `tenants.keys.ts`
Fábrica de query-keys de React Query. Jerárquica, para invalidar por prefijo.
```ts
export const tenantKeys = { all: ["tenants"] as const, lists: () => [...tenantKeys.all, "list"] as const };
```

### `tenants.hooks.ts`
Envuelve `*.api.ts` en `useQuery` / `useMutation`. Las mutaciones invalidan
`<recurso>Keys.all` en `onSuccess`. No hacen `toast` ni cierran diálogos — eso es
del componente.
```ts
export function useTenants() { return useQuery({ queryKey: tenantKeys.lists(), queryFn: tenantsApi.list }); }
export function useCreateTenant() { /* useMutation + invalidate */ }
export function useDeleteTenant() { /* useMutation + invalidate */ }
```

---

## 4. Los componentes

Todos llevan `"use client"`.

| Componente | Responsabilidad |
|---|---|
| `<nombre>-table.tsx` | Define las **columnas** (`Column<Row>[]`) y arma `<DataTable>` de `_shared`. El menú de acciones por fila va aquí, pero **delega** el borrado al padre vía `onDelete(row)`. |
| `<nombre>-form-dialog.tsx` | Diálogo de alta/edición. `react-hook-form` + `zodResolver(schema)`. Controlado (`open` / `onOpenChange`). En el `catch`, si es `ApiError` 422 mapea `err.errors` a `setError`. |
| `delete-<nombre>-dialog.tsx` | Envuelve `<ConfirmDialog>` de `_shared`. Recibe la fila a borrar (o `null`). `toast` de éxito/error. |
| (opcional) `<nombre>-credentials-dialog.tsx` | Solo si el backend devuelve algo que mostrar una vez (como las credenciales del admin al crear un gimnasio). |

---

## 5. La pantalla y la ruta

`tenants-page.tsx` — el único componente "con estado de pantalla":
- llama `useTenants()`;
- `useState` para: diálogo de alta abierto, fila a borrar, resultado a mostrar;
- pinta `<ResourceHeader>` (título + botón "Nuevo") + tabla + los diálogos;
- maneja el estado de error de la query con un aviso + "Reintentar".

`src/app/(central)/tenants/page.tsx`:
```tsx
import { TenantsPage } from "@/features/tenants";
export const metadata = { title: "Gimnasios" };
export default function Page() { return <TenantsPage />; }
```

¿Central o tenant? El módulo va bajo `(central)/` si lo usa el SaaS (gimnasios,
planes) o bajo `(tenant)/` si es de un gimnasio (socios, pagos). Añade la entrada
al menú en `src/components/app-shell/nav.config.ts` y la ruta en
`src/lib/routes.ts`.

---

## 6. Piezas compartidas — dónde vive cada cosa

| Necesitas… | Está en… |
|---|---|
| Botón, input, tabla base, diálogo, select, badge, dropdown | `@repo/ui/*` (primitivas shadcn) |
| Tabla dirigida por config (`DataTable`, `Column`) | `@/features/_shared` |
| Encabezado de pantalla (`ResourceHeader`) | `@/features/_shared` |
| Confirmación genérica (`ConfirmDialog`) | `@/features/_shared` |
| Cliente HTTP (`apiClient`, `ApiError`) | `@repo/api-client` |
| Tipos del backend | `@repo/types` (`components["schemas"][...]`) |
| Toasts (`toast`) | `@repo/ui/toast` (el `<Toaster>` ya está montado en `providers.tsx`) |

Si algo de `_shared` te sirve en 2+ módulos y es **puramente visual**, promuévelo
a `@repo/ui`. Si tiene lógica de React Query / app, se queda en `_shared`.

---

## 7. Checklist para un módulo nuevo

Ejemplo: crear el módulo **Planes** (`plans`, panel central).

1. `cp -r src/features/tenants src/features/plans` y renombra archivos
   (`tenants.*` → `plans.*`).
2. `lib/plans.constants.ts` → `PLANS_ENDPOINT = "/plans"`, etc.
3. `lib/plans.types.ts` → tipos del recurso (de `@repo/types` si existen).
4. `lib/plans.schema.ts` → `createPlanSchema` con las reglas reales.
5. `lib/plans.api.ts` → `list / create / update / remove` según qué exponga la API.
6. `lib/plans.keys.ts` → `planKeys`.
7. `lib/plans.hooks.ts` → `usePlans`, `useCreatePlan`, …
8. `components/plans-table.tsx` → columnas del recurso.
9. `components/plan-form-dialog.tsx` → campos del formulario.
10. `components/delete-plan-dialog.tsx` → normalmente solo cambia el texto.
11. `plans-page.tsx` → ajusta títulos y qué diálogos usa.
12. `index.ts` → exporta `PlansPage` y lo que otros módulos necesiten.
13. `src/app/(central)/plans/page.tsx` → renderiza `<PlansPage />`.
14. `src/lib/routes.ts` + `src/components/app-shell/nav.config.ts` → ya existían
    las entradas; verifícalas.
15. `npm run check-types -w dashboard && npm run lint -w dashboard`.

---

## 8. Convenciones

- **Idioma:** todo lo que ve el usuario (labels, mensajes, toasts, errores) en
  español. Nombres de archivos, variables y tipos en inglés.
- **Nombres de archivo:** `kebab-case`. Los de `lib/` con punto: `plans.api.ts`.
- **`X-Tenant` / auth:** no te preocupes en el módulo. El BFF proxy
  (`/api/proxy/[...path]`) lo añade solo según el subdominio. Ver
  `docs/autenticacion.md` §4.1.
- **Errores de API:** captura `ApiError` de `@repo/api-client`.
  `err.isValidationError` (422) + `err.errors` → `setError` en el form. Otros →
  `toast.error(err.message)`.
- **IDs:** pueden ser `string` (ULID/slug, como los tenants) o `number`. Los
  genéricos de `_shared` usan `string | number`; no asumas `number`.
- **Invalidación:** tras crear/editar/borrar, invalida `<recurso>Keys.all`. No
  hagas `refetch()` a mano.
