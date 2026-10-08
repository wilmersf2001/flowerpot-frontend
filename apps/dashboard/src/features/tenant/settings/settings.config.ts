import { ROUTES } from "@/lib/routes";

export interface SettingsNavItem {
  href: string;
  label: string;
  description: string;
  /** Permiso requerido para ver la sección (catálogo del backend). */
  permission?: string;
}

/**
 * Secciones de la zona de Configuración. Para sumar una (plantillas,
 * historial de documentos…): agregar el item aquí y crear su ruta bajo
 * `src/app/(tenant)/settings/<sección>/page.tsx`.
 */
export const SETTINGS_NAV: SettingsNavItem[] = [
  {
    href: ROUTES.tenant.settingsCompany,
    label: "Empresa y marca",
    description: "Datos legales, colores y logos",
    permission: "settings.view",
  },
  {
    href: ROUTES.tenant.settingsDocuments,
    label: "Documentos y plantillas",
    description: "Textos y formato de los PDF",
    permission: "settings.view",
  },
];
