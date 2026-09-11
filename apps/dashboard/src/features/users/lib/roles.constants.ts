/** Rutas del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const ROLES_ENDPOINT = "/roles";
export const PERMISSIONS_ENDPOINT = "/permissions";

/**
 * Tamaño de página del list de roles. Los roles de un gimnasio son una lista
 * acotada (los 3 predeterminados + los personalizados que cree el dueño), así
 * que se trae todo en una sola página en vez de paginar.
 */
export const ROLES_PER_PAGE = 100;

/** Etiqueta en español de cada módulo del catálogo de permisos (`GET /permissions`). */
const PERMISSION_GROUP_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  members: "Miembros",
  memberships: "Membresías",
  plans: "Planes de membresía",
  leads: "Prospectos",
  checkin: "Check-in",
  attendance: "Asistencia",
  devices: "Dispositivos",
  payments: "Pagos",
  cash_register: "Caja",
  expenses: "Gastos",
  assets: "Activos y equipos",
  branches: "Sedes",
  staff: "Personal",
  notifications: "Notificaciones",
  reports: "Reportes",
  settings: "Configuración",
  users: "Usuarios del sistema",
  roles: "Roles y permisos",
  audit_log: "Auditoría",
  subscription: "Suscripción",
  classes: "Clases",
  instructors: "Instructores",
  bookings: "Reservas",
  inventory: "Inventario",
  communications: "Comunicados",
};

/**
 * Nombre de módulo del catálogo -> etiqueta en español. Si el backend suma un
 * módulo nuevo que todavía no está en el mapa, cae a una versión legible del
 * nombre técnico en vez de romper la pantalla.
 */
export function permissionGroupLabel(group: string): string {
  return (
    PERMISSION_GROUP_LABELS[group] ??
    group.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())
  );
}
