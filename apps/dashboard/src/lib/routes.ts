/**
 * Única fuente de verdad de las rutas del dashboard.
 *
 * Las rutas viven en dos grupos de Next que NO cambian la URL:
 *   src/app/(central)/...  -> panel del SaaS   (admin.<ROOT_DOMAIN>)
 *   src/app/(tenant)/...    -> panel del gimnasio ({slug}.<ROOT_DOMAIN>)
 *
 * `proxy.ts` decide qué panel corresponde según el subdominio.
 */

export const ROUTES = {
  login: "/login",

  central: {
    tenants: "/tenants",
    plans: "/plans",
    subscriptions: "/subscriptions",
    gymSettings: "/gym-settings",
  },

  tenant: {
    members: "/members",
    memberships: "/memberships",
    payments: "/payments",
    attendance: "/attendance",
    checkIn: "/check-in",
    staff: "/staff",
    users: "/users",
    branches: "/branches",
    cashRegister: "/cash-register",
  },
} as const;

/** A dónde se manda al usuario recién autenticado, por panel. */
export const HOME_ROUTE = {
  central: ROUTES.central.tenants,
  tenant: ROUTES.tenant.members,
} as const;
