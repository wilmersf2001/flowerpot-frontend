import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import type { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import {
  BIOMETRIC_SCANS_ENDPOINT,
  BIOMETRIC_SCANS_PER_PAGE,
} from "./biometric-scans.constants";
import type {
  BiometricScanListParams,
  BiometricScanRow,
} from "./biometric-scans.types";

async function list(
  params: BiometricScanListParams = {},
): Promise<Paginated<BiometricScanRow>> {
  const { data } = await apiClient.get<unknown>(BIOMETRIC_SCANS_ENDPOINT, {
    params: buildListParams(params, BIOMETRIC_SCANS_PER_PAGE),
  });
  return unwrapPaginated<BiometricScanRow>(data);
}

/** Marca un aviso como atendido (idempotente en el backend). */
async function acknowledge(id: number): Promise<BiometricScanRow> {
  const { data } = await apiClient.patch<unknown>(
    `${BIOMETRIC_SCANS_ENDPOINT}/${encodeURIComponent(id)}/acknowledge`,
  );
  return unwrapEnvelope<BiometricScanRow>(data);
}

export const biometricScansApi = { list, acknowledge };
