/** Ruta del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const INSTRUCTOR_SCHEDULES_ENDPOINT = "/instructor-schedules";

/**
 * Tamaño de página del listado de horarios. Siempre se consulta acotado a un
 * instructor, así que se trae todo en una sola página en vez de paginar.
 */
export const INSTRUCTOR_SCHEDULES_PER_PAGE = 50;

/** Días de la semana (1 = Lunes ... 7 = Domingo) para el `Combobox` del formulario. */
export const DAY_OF_WEEK_OPTIONS = [
  { value: "1", label: "Lunes" },
  { value: "2", label: "Martes" },
  { value: "3", label: "Miércoles" },
  { value: "4", label: "Jueves" },
  { value: "5", label: "Viernes" },
  { value: "6", label: "Sábado" },
  { value: "7", label: "Domingo" },
] as const;

/** Etiqueta de un `day_of_week` (1-7) para pintar en la tabla. */
export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};
