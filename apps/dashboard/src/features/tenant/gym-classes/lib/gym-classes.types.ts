// TODO(gen): `api.d.ts` todavía no tiene `GymClassResource`. Se escribe a mano
// y se reemplaza al correr `npm run gen -w packages/types`.

export interface GymClassSpecialty {
  id: string;
  name: string;
}

export interface GymClassRow {
  id: string;
  specialty_id: string | null;
  /** Solo viene cargada en el `index`; en `store`/`update`/`show` es `null`. */
  specialty: GymClassSpecialty | null;
  name: string;
  description: string;
  duration_minutes: number;
  max_capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface GymClassListParams {
  page?: number;
  perPage?: number;
  search?: string;
}

/** Cuerpo de `POST /gym-classes` (`StoreGymClassRequest`). */
export interface CreateGymClassInput {
  specialty_id?: number | null;
  name: string;
  description?: string | null;
  duration_minutes: number;
  max_capacity: number;
  is_active?: boolean;
}

/** Cuerpo de `PATCH /gym-classes/{id}` (`UpdateGymClassRequest`). */
export interface UpdateGymClassInput {
  specialty_id?: number | null;
  name?: string;
  description?: string | null;
  duration_minutes?: number;
  max_capacity?: number;
  is_active?: boolean;
}
