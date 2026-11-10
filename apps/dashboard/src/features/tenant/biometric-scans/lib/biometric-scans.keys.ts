import type { BiometricScanListParams } from "./biometric-scans.types";

export const biometricScanKeys = {
  all: ["biometricScans"] as const,
  lists: () => [...biometricScanKeys.all, "list"] as const,
  list: (params: BiometricScanListParams) =>
    [...biometricScanKeys.lists(), params] as const,
};
