/** Resultado de `POST /checkin` (`CheckInResult` en la API). */
export type CheckInStatus =
  | "success"
  | "already_checked_in"
  | "not_found"
  | "inactive"
  | "no_membership"
  | "branch_denied";

/** Cuerpo de `POST /checkin`: QR o, si el socio lo olvidó, DNI. */
export interface CheckInInput {
  qr_code?: string;
  dni?: string;
  branch_id: number;
  source: "qr" | "manual";
}

/** `data` de la respuesta (`CheckInResource`). */
export interface CheckInData {
  status: CheckInStatus;
  member: { id: number; full_name: string; dni: string } | null;
  membership: {
    id: number;
    plan_name: string;
    ends_at: string;
    days_remaining: number;
  } | null;
}

/** Lo que muestra la pantalla de recepción por cada intento. */
export interface CheckInOutcome {
  /** Clave para la lista de "últimos intentos". */
  key: string;
  at: Date;
  code: string;
  status: CheckInStatus | "error";
  message: string;
  data: CheckInData | null;
}
