import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  GymSettingsListParams,
  UpdateGymSettingsInput,
} from "./gym-settings.types";
import { gymSettingsKeys } from "./gym-settings.keys";
import { gymSettingsApi } from "./gym-settings.api";

export function useGymSettings(params: GymSettingsListParams = {}) {
  return useQuery({
    queryKey: gymSettingsKeys.list(params),
    queryFn: () => gymSettingsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateGymSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateGymSettingsInput;
    }) => gymSettingsApi.update(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: gymSettingsKeys.all }),
  });
}
