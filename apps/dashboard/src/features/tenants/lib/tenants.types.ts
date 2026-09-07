/**
 * Tipos del módulo de gimnasios (tenants).
 *
 * TODO(gen): el backend expone `TenantRequest` y `TenantResource` como stubs en
 * `@repo/types` (`api.d.ts`) porque Scramble todavía no los anota. Cuando el
 * backend complete las anotaciones y se corra `npm run gen -w packages/types`,
 * reemplazar estos tipos por los generados.
 */

/**
 * Cuerpo de `POST /tenants`. Hoy la única regla es:
 *   'id' => 'required|string|alpha_dash|unique:tenants,id'
 */
export interface CreateTenantInput {
  id: string;
}

/**
 * Query de `GET /tenants`: paginado (`page`) + búsqueda de texto libre.
 * En la UI el usuario busca por el identificador del gimnasio, pero el backend
 * recibe ese texto en el parámetro `search`.
 */
export interface TenantListParams {
  page?: number;
  perPage?: number;
  search?: string;
}

/** Fila de `GET /tenants` — `TenantResource` = `parent::toArray()` del modelo. */
export interface TenantRow {
  id: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

/** Datos de `POST /tenants` en caso de éxito: el backend crea el admin inicial. */
export interface CreateTenantResult {
  tenant: TenantRow;
  admin_email: string;
  admin_password: string;
}
