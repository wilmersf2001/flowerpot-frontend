/** Ruta del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const EQUIPMENT_ENDPOINT = "/equipment";

/** Tamaño de página por defecto del listado de equipos. */
export const EQUIPMENT_PER_PAGE = 15;

/**
 * Estados de un equipo. El backend los mueve automáticamente según el flujo
 * de mantenimientos; `fuera_de_servicio` y la reactivación manual solo se
 * asignan con `PATCH /equipment/{id}` directo (no expuesto en el formulario
 * de alta/edición). Para retirar un equipo se usa el endpoint de dar de baja.
 */
export const EQUIPMENT_STATUSES = [
  "operativo",
  "en_mantenimiento",
  "fuera_de_servicio",
  "dado_de_baja",
] as const;
