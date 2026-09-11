// TODO(gen): `api.d.ts` (`UserResource`) todavía no lista `is_owner`,
// `permissions` ni `branches` en `GET /auth/me`, pero la respuesta real del
// backend sí los trae. Se confía en el `toArray()` real, no en el schema.

export interface CurrentUserBranch {
  id: string;
  name: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isOwner: boolean;
  permissions: string[];
  branches: CurrentUserBranch[];
}
