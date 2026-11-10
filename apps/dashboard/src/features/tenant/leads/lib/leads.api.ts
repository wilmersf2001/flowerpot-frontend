import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import type { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import {
  LEADS_ENDPOINT,
  LEADS_IMPORT_ENDPOINT,
  LEADS_IMPORT_TEMPLATE_ENDPOINT,
  LEADS_PER_PAGE,
} from "./leads.constants";
import type {
  ConvertLeadInput,
  CreateLeadInput,
  ImportLeadsResult,
  LeadListParams,
  LeadRow,
  UpdateLeadInput,
} from "./leads.types";

const leadUrl = (id: number) => `${LEADS_ENDPOINT}/${encodeURIComponent(id)}`;

async function list(params: LeadListParams = {}): Promise<Paginated<LeadRow>> {
  const { data } = await apiClient.get<unknown>(LEADS_ENDPOINT, {
    params: buildListParams(params, LEADS_PER_PAGE),
  });
  return unwrapPaginated<LeadRow>(data);
}

async function create(input: CreateLeadInput): Promise<LeadRow> {
  const { data } = await apiClient.post<unknown>(LEADS_ENDPOINT, input);
  return unwrapEnvelope<LeadRow>(data);
}

async function update(id: number, input: UpdateLeadInput): Promise<LeadRow> {
  const { data } = await apiClient.patch<unknown>(leadUrl(id), input);
  return unwrapEnvelope<LeadRow>(data);
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(leadUrl(id));
}

async function advance(id: number): Promise<LeadRow> {
  const { data } = await apiClient.post<unknown>(`${leadUrl(id)}/advance`);
  return unwrapEnvelope<LeadRow>(data);
}

async function lose(id: number): Promise<LeadRow> {
  const { data } = await apiClient.patch<unknown>(`${leadUrl(id)}/lose`);
  return unwrapEnvelope<LeadRow>(data);
}

async function convert(id: number, input: ConvertLeadInput): Promise<LeadRow> {
  const { data } = await apiClient.post<unknown>(`${leadUrl(id)}/convert`, input);
  return unwrapEnvelope<LeadRow>(data);
}

/** Descarga la plantilla `.xlsx` (requiere token: se pide como blob). */
async function downloadTemplate(): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(LEADS_IMPORT_TEMPLATE_ENDPOINT, {
    responseType: "blob",
  });
  return data;
}

async function importFile(file: File, branchId?: number): Promise<ImportLeadsResult> {
  const form = new FormData();
  form.append("file", file);
  if (branchId) form.append("branch_id", String(branchId));
  const { data } = await apiClient.post<unknown>(LEADS_IMPORT_ENDPOINT, form);
  return unwrapEnvelope<ImportLeadsResult>(data);
}

export const leadsApi = {
  list,
  create,
  update,
  remove,
  advance,
  lose,
  convert,
  downloadTemplate,
  importFile,
};
