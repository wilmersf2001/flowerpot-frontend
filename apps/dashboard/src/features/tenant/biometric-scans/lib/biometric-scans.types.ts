import type { BaseListParams } from "@/features/_shared/list-params";

/**
 * Resultado de una marcación del lector. Solo `success` es una entrada
 * normal; el resto es un aviso para recepción (`is_alert`).
 */
export type BiometricScanStatus =
  | "success"
  | "already_checked_in"
  | "no_membership"
  | "inactive"
  | "unknown_pin";

export interface BiometricScanListParams extends BaseListParams {
  branch_id?: string;
  /** `1` = solo alertas sin atender. */
  pending?: "1";
  /** Solo marcaciones con id mayor a este (para pedir únicamente lo nuevo). */
  since_id?: number;
}

/** `BiometricScanResource`. */
export interface BiometricScanRow {
  id: number;
  status: BiometricScanStatus | (string & {});
  message: string | null;
  is_alert: boolean;
  pin: string | null;
  scanned_at: string;
  verify_type: string | number | null;
  member: {
    id: number;
    full_name: string;
    dni: string;
    photo_url: string | null;
  } | null;
  device: { id: number; name: string | null } | null;
  branch_id: number | null;
  attendance_id: number | null;
  acknowledged_at: string | null;
}
