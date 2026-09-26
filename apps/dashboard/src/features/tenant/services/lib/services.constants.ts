/** Ruta del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const SERVICES_ENDPOINT = "/services";

/** Tamaño de página por defecto del list de servicios. */
export const SERVICES_PER_PAGE = 100;

/** Tipos de servicio que acepta el backend (`in:facility,class,consultation`). */
export const SERVICE_TYPES = ["facility", "class", "consultation"] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  facility: "Instalación",
  class: "Clase",
  consultation: "Consulta",
};

export const SERVICE_TYPE_OPTIONS = SERVICE_TYPES.map((value) => ({
  value,
  label: SERVICE_TYPE_LABELS[value],
}));
