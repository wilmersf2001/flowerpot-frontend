/** Ruta del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const TENANTS_ENDPOINT = "/tenants";

/**
 * Patrón `alpha_dash` de Laravel: letras, números, guion y guion bajo.
 * Es el identificador del gimnasio y, a la vez, su subdominio.
 */
export const TENANT_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

/** Tamaño de página por defecto del list de gimnasios. */
export const TENANTS_PER_PAGE = 10;
