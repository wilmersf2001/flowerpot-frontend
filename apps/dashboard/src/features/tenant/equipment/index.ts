export { EquipmentPage } from "./equipment-page";

export {
  useEquipmentList,
  useEquipmentDetail,
  useEquipmentOptions,
  useCreateEquipment,
  useUpdateEquipment,
  useDeleteEquipment,
  useRestoreEquipment,
  useDecommissionEquipment,
} from "./lib/equipment.hooks";
export { equipmentApi } from "./lib/equipment.api";
export { equipmentKeys } from "./lib/equipment.keys";
export type {
  EquipmentRow,
  EquipmentStatus,
  EquipmentListParams,
  CreateEquipmentInput,
  UpdateEquipmentInput,
} from "./lib/equipment.types";
