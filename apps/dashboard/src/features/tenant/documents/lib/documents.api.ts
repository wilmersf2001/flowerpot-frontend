import { apiClient, unwrapEnvelope, unwrapList } from "@repo/api-client";
import {
  DOCUMENT_TEMPLATES_ENDPOINT,
  GENERATED_DOCUMENTS_ENDPOINT,
} from "./documents.constants";
import type {
  DocumentTemplate,
  DocumentTemplateSummary,
  GeneratedDocument,
  UpdateDocumentTemplateInput,
} from "./documents.types";

const templateUrl = (type: string) =>
  `${DOCUMENT_TEMPLATES_ENDPOINT}/${encodeURIComponent(type)}`;

/* ------------------------------ Plantillas ------------------------------ */

async function listTemplates(): Promise<DocumentTemplateSummary[]> {
  const { data } = await apiClient.get<unknown>(DOCUMENT_TEMPLATES_ENDPOINT);
  return unwrapList<DocumentTemplateSummary>(data);
}

async function showTemplate(type: string): Promise<DocumentTemplate> {
  const { data } = await apiClient.get<unknown>(templateUrl(type));
  return unwrapEnvelope<DocumentTemplate>(data);
}

async function updateTemplate(
  type: string,
  input: UpdateDocumentTemplateInput,
): Promise<DocumentTemplate> {
  const { data } = await apiClient.patch<unknown>(templateUrl(type), input);
  return unwrapEnvelope<DocumentTemplate>(data);
}

/** Vuelve título y texto al valor por defecto y deja `layout: null`. */
async function resetTemplate(type: string): Promise<DocumentTemplate> {
  const { data } = await apiClient.post<unknown>(`${templateUrl(type)}/reset`);
  return unwrapEnvelope<DocumentTemplate>(data);
}

/* --------------------------- Documentos emitidos --------------------------- */

async function listGenerated(
  type: string,
  documentableId: number | string,
): Promise<GeneratedDocument[]> {
  const { data } = await apiClient.get<unknown>(GENERATED_DOCUMENTS_ENDPOINT, {
    params: { type, documentable_id: Number(documentableId) },
  });
  return unwrapList<GeneratedDocument>(data);
}

/** Emite y guarda una copia nueva (cada llamada crea otra entrada). */
async function issue(
  type: string,
  documentableId: number | string,
): Promise<GeneratedDocument> {
  const { data } = await apiClient.post<unknown>(GENERATED_DOCUMENTS_ENDPOINT, {
    type,
    documentable_id: Number(documentableId),
  });
  return unwrapEnvelope<GeneratedDocument>(data);
}

export const generatedDownloadPath = (id: number) =>
  `${GENERATED_DOCUMENTS_ENDPOINT}/${encodeURIComponent(id)}/download`;

export const documentsApi = {
  listTemplates,
  showTemplate,
  updateTemplate,
  resetTemplate,
  listGenerated,
  issue,
};
