import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { EQUIPMENT_ENDPOINT, EQUIPMENT_PER_PAGE } from "./equipment.constants";
import {
  CreateEquipmentInput,
  EquipmentBranchRef,
  EquipmentCategoryRef,
  EquipmentListParams,
  EquipmentMaintenanceRef,
  EquipmentRow,
  UpdateEquipmentInput,
} from "./equipment.types";

function toCategoryRef(raw: unknown): EquipmentCategoryRef | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  return { id: String(c.id), name: String(c.name ?? "") };
}

function toBranchRef(raw: unknown): EquipmentBranchRef | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  return { id: String(b.id), name: String(b.name ?? "") };
}

function toMaintenanceRef(raw: unknown): EquipmentMaintenanceRef {
  const r = (raw ?? {}) as Record<string, unknown>;
  const supplier = r.supplier as Record<string, unknown> | null | undefined;
  return {
    id: String(r.id),
    type: (r.type as EquipmentMaintenanceRef["type"]) ?? "preventivo",
    status: (r.status as EquipmentMaintenanceRef["status"]) ?? "programado",
    description: String(r.description ?? ""),
    scheduled_date: r.scheduled_date == null ? null : String(r.scheduled_date),
    started_at: r.started_at == null ? null : String(r.started_at),
    completed_at: r.completed_at == null ? null : String(r.completed_at),
    cost: r.cost == null ? null : Number(r.cost),
    next_maintenance_date: r.next_maintenance_date == null ? null : String(r.next_maintenance_date),
    supplier_id: String(r.supplier_id),
    supplier: supplier ? { id: String(supplier.id), name: String(supplier.name ?? "") } : null,
    created_at: String(r.created_at ?? ""),
    updated_at: String(r.updated_at ?? ""),
  };
}

/**
 * `store`/`update` no devuelven `maintenances` (solo `index`/`show` sí, y
 * solo `show` trae el historial completo). `purchase_cost` llega en `0`
 * cuando nunca se definió, aunque también puede llegar `null` directo.
 */
function toEquipmentRow(raw: Record<string, unknown>): EquipmentRow {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    brand: raw.brand == null ? null : String(raw.brand),
    model: raw.model == null ? null : String(raw.model),
    serial_number: raw.serial_number == null ? null : String(raw.serial_number),
    purchase_date: raw.purchase_date == null ? null : String(raw.purchase_date),
    purchase_cost: raw.purchase_cost == null ? null : Number(raw.purchase_cost),
    warranty_expiration: raw.warranty_expiration == null ? null : String(raw.warranty_expiration),
    status: (raw.status as EquipmentRow["status"]) ?? "operativo",
    equipment_category_id:
      raw.equipment_category_id == null ? null : String(raw.equipment_category_id),
    category: toCategoryRef(raw.category),
    branch_id: String(raw.branch_id),
    branch: toBranchRef(raw.branch),
    maintenances: Array.isArray(raw.maintenances) ? raw.maintenances.map(toMaintenanceRef) : [],
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    deleted_at: raw.deleted_at == null ? null : String(raw.deleted_at),
  };
}

async function list(params: EquipmentListParams = {}): Promise<Paginated<EquipmentRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(EQUIPMENT_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? EQUIPMENT_PER_PAGE,
      search: search ? search : undefined,
      equipment_category_id: params.categoryId || undefined,
      branch_id: params.branchId || undefined,
      status: params.status || undefined,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toEquipmentRow) };
}

/** Trae el equipo con categoría, sede e historial de mantenimientos. */
async function show(id: string): Promise<EquipmentRow> {
  const { data } = await apiClient.get<unknown>(`${EQUIPMENT_ENDPOINT}/${encodeURIComponent(id)}`);
  return toEquipmentRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function create(input: CreateEquipmentInput): Promise<EquipmentRow> {
  const { data } = await apiClient.post<unknown>(EQUIPMENT_ENDPOINT, input);
  return toEquipmentRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(id: string, input: UpdateEquipmentInput): Promise<EquipmentRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EQUIPMENT_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toEquipmentRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${EQUIPMENT_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura un equipo eliminado (soft-delete). */
async function restore(id: string): Promise<EquipmentRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EQUIPMENT_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return toEquipmentRow(unwrapEnvelope<Record<string, unknown>>(data));
}

/**
 * Da de baja el equipo (`status` -> `dado_de_baja`). Falla si tiene un
 * mantenimiento `programado` o `en_progreso` abierto. Sin body.
 */
async function decommission(id: string): Promise<EquipmentRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EQUIPMENT_ENDPOINT}/${encodeURIComponent(id)}/decommission`,
  );
  return toEquipmentRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const equipmentApi = { list, show, create, update, remove, restore, decommission };
