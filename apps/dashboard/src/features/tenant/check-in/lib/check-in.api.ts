import { apiClient } from "@repo/api-client";
import type { CheckInData, CheckInInput } from "./check-in.types";

/** Ruta del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const CHECK_IN_ENDPOINT = "/checkin";

/**
 * Registra una entrada. Éxito y "ya registró hoy" vuelven con 200; el resto
 * de rechazos (sin membresía, inactivo, otra sede…) llegan como `ApiError`.
 */
async function checkIn(
  input: CheckInInput,
): Promise<{ message: string; data: CheckInData }> {
  const { data } = await apiClient.post<{ message?: string; data: CheckInData }>(
    CHECK_IN_ENDPOINT,
    input,
  );
  return { message: data.message ?? "", data: data.data };
}

export const checkInApi = { checkIn };
