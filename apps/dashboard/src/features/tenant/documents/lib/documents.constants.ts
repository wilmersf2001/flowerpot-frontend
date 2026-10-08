/** Id de un registro con documentos (algunos módulos lo normalizan a string). */
export type DocumentRecordId = number | string;

export const DOCUMENT_TEMPLATES_ENDPOINT = "/document-templates";
export const GENERATED_DOCUMENTS_ENDPOINT = "/generated-documents";

/** Permisos de la pantalla de plantillas (el backend los re-valida). */
export const DOCUMENTS_VIEW_PERMISSION = "settings.view";
export const DOCUMENTS_EDIT_PERMISSION = "settings.edit_general";

/** Límite del cuerpo de una plantilla (`UpdateDocumentTemplateRequest`). */
export const TEMPLATE_BODY_MAX = 20_000;
export const TEMPLATE_TITLE_MAX = 255;

/**
 * Valor del selector de formato que significa "heredar el de la empresa"
 * (`layout: null` en la API). Un `Combobox` no admite `null` como valor.
 */
export const INHERIT_LAYOUT = "__inherit__";

/**
 * Documentos que se descargan desde un registro concreto (`documentable_id`).
 *
 * El catálogo vivo es `GET /document-templates` (la pantalla de plantillas se
 * arma con él), pero los botones de cada módulo necesitan saber la ruta de
 * descarga y los permisos sin esperar a esa consulta, por eso viven aquí.
 */
export const RECORD_DOCUMENTS = {
  membership_contract: {
    label: "Contrato de membresía",
    downloadLabel: "Descargar contrato",
    path: (id: DocumentRecordId) => `/memberships/${id}/contract`,
    fileName: (id: DocumentRecordId) => `contrato-membresia-${id}.pdf`,
    viewPermission: "memberships.view",
    generatePermission: "memberships.edit",
  },
  payment_receipt: {
    label: "Recibo de pago",
    downloadLabel: "Descargar recibo",
    path: (id: DocumentRecordId) => `/payments/${id}/receipt`,
    fileName: (id: DocumentRecordId) => `recibo-pago-${id}.pdf`,
    viewPermission: "payments.view",
    generatePermission: "payments.view",
  },
  staff_contract: {
    label: "Contrato de trabajo",
    downloadLabel: "Descargar contrato",
    path: (id: DocumentRecordId) => `/staff/${id}/contract`,
    fileName: (id: DocumentRecordId) => `contrato-trabajo-${id}.pdf`,
    viewPermission: "staff.view",
    generatePermission: "staff.edit",
  },
  instructor_contract: {
    label: "Contrato de instructor",
    downloadLabel: "Descargar contrato",
    path: (id: DocumentRecordId) => `/instructors/${id}/contract`,
    fileName: (id: DocumentRecordId) => `contrato-instructor-${id}.pdf`,
    viewPermission: "instructors.view",
    generatePermission: "instructors.edit",
  },
  sale_receipt: {
    label: "Comprobante de venta",
    downloadLabel: "Descargar comprobante",
    path: (id: DocumentRecordId) => `/sales/${id}/receipt`,
    fileName: (id: DocumentRecordId) => `comprobante-venta-${id}.pdf`,
    viewPermission: "store.view",
    generatePermission: "store.view",
  },
  purchase_order: {
    label: "Orden de compra",
    downloadLabel: "Descargar orden",
    path: (id: DocumentRecordId) => `/purchase-orders/${id}/document`,
    fileName: (id: DocumentRecordId) => `orden-compra-${id}.pdf`,
    viewPermission: "inventory.view",
    generatePermission: "inventory.view",
  },
  cash_closing_report: {
    label: "Reporte de cierre de caja",
    downloadLabel: "Descargar reporte",
    path: (id: DocumentRecordId) => `/cash-registers/${id}/report`,
    fileName: (id: DocumentRecordId) => `reporte-cierre-caja-${id}.pdf`,
    viewPermission: "cash_register.view_history",
    generatePermission: "cash_register.view_history",
  },
} as const;

export type RecordDocumentType = keyof typeof RECORD_DOCUMENTS;
