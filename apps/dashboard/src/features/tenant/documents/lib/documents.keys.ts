/** Fábrica de query-keys de React Query para plantillas y documentos emitidos. */
export const documentKeys = {
  all: ["documents"] as const,
  templates: () => [...documentKeys.all, "templates"] as const,
  template: (type: string) => [...documentKeys.templates(), type] as const,
  generated: () => [...documentKeys.all, "generated"] as const,
  generatedFor: (type: string, documentableId: number | string) =>
    [...documentKeys.generated(), type, documentableId] as const,
};
