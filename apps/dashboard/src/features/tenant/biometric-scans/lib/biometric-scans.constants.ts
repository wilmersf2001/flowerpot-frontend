import type { StatusMap } from "@/features/_shared";

/** Ruta del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const BIOMETRIC_SCANS_ENDPOINT = "/biometric-scans";

/** Tamaño de página de la bitácora y de los avisos pendientes. */
export const BIOMETRIC_SCANS_PER_PAGE = 30;

/** Cada cuánto se refresca mientras la pestaña está visible. */
export const BIOMETRIC_SCANS_REFRESH_MS = 5000;

/** Permiso para ver la bitácora y atender avisos. */
export const BIOMETRIC_SCANS_PERMISSION = "checkin.view_today";

export const BIOMETRIC_STATUS_MAP: StatusMap = {
  success: { label: "Entró", tone: "success" },
  already_checked_in: { label: "Ya entró hoy", tone: "warning" },
  no_membership: { label: "Sin membresía", tone: "danger" },
  inactive: { label: "Socio inactivo", tone: "danger" },
  unknown_pin: { label: "PIN desconocido", tone: "danger" },
};
