// TODO(gen): `api.d.ts` (`UserResource`) todavía no lista `is_owner`,
// `permissions` ni `branches` en `GET /auth/me`, pero la respuesta real del
// backend sí los trae. Se confía en el `toArray()` real, no en el schema.

export interface CurrentUserBranch {
  id: string;
  name: string;
}

/** Estado del plan contratado por el gimnasio (tenant), tal como lo expone `/auth/me`. */
export interface CurrentUserSubscription {
  plan: string;
  status: string;
  isTrial: boolean;
  startsAt: string;
  endsAt: string;
  daysRemaining: number;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isOwner: boolean;
  permissions: string[];
  branches: CurrentUserBranch[];
  /** `null` en el panel central, donde no hay un tenant/plan asociado al usuario. */
  subscription: CurrentUserSubscription | null;
}
