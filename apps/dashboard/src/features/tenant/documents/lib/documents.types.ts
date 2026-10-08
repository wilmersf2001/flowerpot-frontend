export interface LayoutOption {
  key: string;
  label: string;
}

/** Fila del catálogo: `GET /document-templates`. */
export interface DocumentTemplateSummary {
  type: string;
  label: string;
  /** Formato propio del documento. `null` = hereda el de la empresa. */
  layout: string | null;
  /** Formato que realmente se usará hoy. */
  effective_layout: string;
  available_layouts: LayoutOption[];
  /** Ruta de descarga con `{id}` por reemplazar. */
  download: string;
  view_permission: string;
  generate_permission: string;
}

export interface TemplateVariable {
  key: string;
  /** Texto a insertar, p. ej. `{{member_name}}`. */
  token: string;
  label: string;
}

/** Detalle editable: `GET /document-templates/{type}`. */
export interface DocumentTemplate {
  type: string;
  title: string;
  layout: string | null;
  available_layouts: LayoutOption[];
  body: string;
  variables: TemplateVariable[];
  updated_at: string | null;
}

/** Cuerpo de `PATCH /document-templates/{type}`. */
export interface UpdateDocumentTemplateInput {
  title?: string;
  body?: string;
  layout?: string | null;
}

/** Copia inmutable emitida: `POST/GET /generated-documents`. */
export interface GeneratedDocument {
  id: number;
  type: string;
  title: string;
  layout: string;
  /** Tamaño en bytes. */
  size: number;
  checksum: string;
  documentable_id: number;
  generated_by: { id: number; name: string } | null;
  created_at: string;
}
