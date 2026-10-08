import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "./documents.api";
import { documentKeys } from "./documents.keys";
import type { UpdateDocumentTemplateInput } from "./documents.types";

/** Catálogo de documentos (la pantalla de plantillas se arma con esto). */
export function useDocumentTemplates() {
  return useQuery({
    queryKey: documentKeys.templates(),
    queryFn: documentsApi.listTemplates,
  });
}

/** Detalle editable de una plantilla. Solo consulta cuando hay `type`. */
export function useDocumentTemplate(type: string | null) {
  return useQuery({
    queryKey: documentKeys.template(type ?? ""),
    queryFn: () => documentsApi.showTemplate(type!),
    enabled: type !== null,
  });
}

export function useUpdateDocumentTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      type,
      input,
    }: {
      type: string;
      input: UpdateDocumentTemplateInput;
    }) => documentsApi.updateTemplate(type, input),
    // El catálogo muestra el formato efectivo, que cambia al editar `layout`.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.templates() }),
  });
}

export function useResetDocumentTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (type: string) => documentsApi.resetTemplate(type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.templates() }),
  });
}

/** Copias emitidas de un registro (más reciente primero). */
export function useGeneratedDocuments(
  type: string,
  documentableId: number | string | null,
) {
  return useQuery({
    queryKey: documentKeys.generatedFor(type, documentableId ?? 0),
    queryFn: () => documentsApi.listGenerated(type, documentableId!),
    enabled: documentableId !== null,
  });
}

export function useIssueDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      type,
      documentableId,
    }: {
      type: string;
      documentableId: number | string;
    }) => documentsApi.issue(type, documentableId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.generated() }),
  });
}
