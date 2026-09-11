import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { BRANCHES_ENDPOINT, BRANCHES_PER_PAGE } from "./branches.constants";
import { BranchListParams, BranchRow, CreateBranchInput, UpdateBranchInput } from "./branches.types";

/** El backend manda `is_active` con un tipo inconsistente ("true"/true/1). */
function toBranchRow(raw: Record<string, unknown>): BranchRow {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    address: String(raw.address ?? ""),
    phone: String(raw.phone ?? ""),
    timezone: String(raw.timezone ?? ""),
    is_active: raw.is_active === true || raw.is_active === "true" || raw.is_active === 1,
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    deleted_at: raw.deleted_at == null ? null : String(raw.deleted_at),
  };
}

async function list(params: BranchListParams = {}): Promise<Paginated<BranchRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(BRANCHES_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? BRANCHES_PER_PAGE,
      search: search ? search : undefined,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toBranchRow) };
}

async function create(input: CreateBranchInput): Promise<BranchRow> {
  const { data } = await apiClient.post<unknown>(BRANCHES_ENDPOINT, input);
  return toBranchRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(id: string, input: UpdateBranchInput): Promise<BranchRow> {
  const { data } = await apiClient.patch<unknown>(
    `${BRANCHES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toBranchRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${BRANCHES_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Activa/desactiva una sede. El backend rechaza desactivar la única sede activa. */
async function toggleActive(id: string): Promise<BranchRow> {
  const { data } = await apiClient.patch<unknown>(
    `${BRANCHES_ENDPOINT}/${encodeURIComponent(id)}/toggle-active`,
  );
  return toBranchRow(unwrapEnvelope<Record<string, unknown>>(data));
}

/** Restaura una sede eliminada (soft-delete). */
async function restore(id: string): Promise<BranchRow> {
  const { data } = await apiClient.post<unknown>(
    `${BRANCHES_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return toBranchRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const branchesApi = { list, create, update, remove, toggleActive, restore };
