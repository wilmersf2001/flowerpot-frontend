// TODO(gen): `api.d.ts` tipa `RoleResource.permissions` y
// `permission.index.data` como `string` plano. Verificado contra la API real:
// son estructuras (ver abajo). Reemplazar por los tipos generados cuando se
// regenere `packages/types/src/api.d.ts` con la anotación correcta.

/** Un permiso del catálogo (`GET /permissions`) o dentro de un rol. */
export interface PermissionEntry {
  id: number;
  /** Nombre técnico, p. ej. `"members.view"`. Es lo que viaja en los forms. */
  name: string;
  /** Etiqueta legible, p. ej. `"Ver Lista de Miembros"`. */
  label: string;
}

/** `GET /permissions` -> permisos agrupados por módulo (`members`, `roles`, …). */
export type PermissionCatalog = Record<string, PermissionEntry[]>;

export interface RoleRow {
  id: number;
  name: string;
  /** `false` en los roles sembrados (gym_owner, admin, receptionist). */
  is_custom: boolean;
  users_count: number;
  permissions: PermissionEntry[];
}

export interface RoleListParams {
  page?: number;
  perPage?: number;
}

/** Cuerpo de `POST /roles` y `PATCH /roles/{role}` (`RoleRequest`). */
export interface RoleInput {
  name: string;
  /** Nombres de permiso (`PermissionEntry.name`), no ids. */
  permissions: string[];
}
