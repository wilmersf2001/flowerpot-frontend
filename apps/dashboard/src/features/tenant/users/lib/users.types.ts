// TODO(gen): `api.d.ts` no confirma el shape real de `GET /users` (el schema
// `App.Http.Resources.Tenant.UserResource` tipa `is_owner` como `string`).
// Se normaliza a `boolean` en `users.api.ts` al mapear la fila.

import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  /** Nombre del rol asignado, p. ej. `"gym_owner"`. */
  role: string;
  /** Dueño del gimnasio: sin eliminar ni quitarle el rol desde la UI. */
  is_owner: boolean;
}

export type UserListParams = BaseListParams;

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type UserFilters = ListFilters<UserListParams>;

/** Cuerpo de `POST /users` (`StoreUserRequest`). */
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/**
 * Cuerpo de `PUT /users/{user}` (`UpdateUserRequest`). `password` va solo si
 * el usuario decide cambiarla.
 */
export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
}
