import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { INSTRUCTORS_ENDPOINT, INSTRUCTORS_PER_PAGE } from "./instructors.constants";
import {
  CreateInstructorInput,
  InstructorListParams,
  InstructorRow,
  InstructorSpecialty,
  InstructorStaff,
  InstructorStaffBranch,
  UpdateInstructorInput,
} from "./instructors.types";

function toInstructorStaffBranches(raw: unknown): InstructorStaffBranch[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((branch) => {
    const b = branch as Record<string, unknown>;
    return { id: String(b.id), name: String(b.name ?? "") };
  });
}

/** El backend anida el `StaffResource` completo bajo `staff`. */
function toInstructorStaff(raw: unknown): InstructorStaff | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  const jobPosition = s.job_position as Record<string, unknown> | undefined;
  return {
    id: String(s.id),
    full_name: String(s.full_name ?? ""),
    first_name: String(s.first_name ?? ""),
    last_name: String(s.last_name ?? ""),
    dni: String(s.dni ?? ""),
    phone: String(s.phone ?? ""),
    email: String(s.email ?? ""),
    is_active: s.is_active === true || s.is_active === "true" || s.is_active === 1,
    job_position_name: jobPosition ? String(jobPosition.name ?? "") : null,
    branches: toInstructorStaffBranches(s.branches),
  };
}

function toInstructorSpecialties(raw: unknown): InstructorSpecialty[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((specialty) => {
    const s = specialty as Record<string, unknown>;
    return { id: String(s.id), name: String(s.name ?? "") };
  });
}

/** El backend manda `is_active` con un tipo inconsistente ("true"/true/1). */
function toInstructorRow(raw: Record<string, unknown>): InstructorRow {
  return {
    id: String(raw.id),
    staff_id: String(raw.staff_id ?? ""),
    staff: toInstructorStaff(raw.staff),
    bio: String(raw.bio ?? ""),
    tarifa_por_clase: raw.tarifa_por_clase == null ? "" : String(raw.tarifa_por_clase),
    fecha_inicio: raw.fecha_inicio == null ? null : String(raw.fecha_inicio),
    is_active: raw.is_active === true || raw.is_active === "true" || raw.is_active === 1,
    specialties: toInstructorSpecialties(raw.specialties),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    deleted_at: raw.deleted_at == null ? null : String(raw.deleted_at),
  };
}

async function list(params: InstructorListParams = {}): Promise<Paginated<InstructorRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(INSTRUCTORS_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? INSTRUCTORS_PER_PAGE,
      search: search ? search : undefined,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toInstructorRow) };
}

async function create(input: CreateInstructorInput): Promise<InstructorRow> {
  const { data } = await apiClient.post<unknown>(INSTRUCTORS_ENDPOINT, input);
  return toInstructorRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(id: string, input: UpdateInstructorInput): Promise<InstructorRow> {
  const { data } = await apiClient.patch<unknown>(
    `${INSTRUCTORS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toInstructorRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${INSTRUCTORS_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura un instructor eliminado (soft-delete). */
async function restore(id: string): Promise<InstructorRow> {
  const { data } = await apiClient.patch<unknown>(
    `${INSTRUCTORS_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return toInstructorRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const instructorsApi = { list, create, update, remove, restore };
