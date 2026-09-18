export { ClassSchedulesPage } from "./class-schedules-page";

export {
  useClassSchedules,
  useCreateClassSchedule,
  useUpdateClassSchedule,
  useDeleteClassSchedule,
  useRestoreClassSchedule,
  useToggleClassScheduleActive,
} from "./lib/class-schedules.hooks";
export { classSchedulesApi } from "./lib/class-schedules.api";
export type {
  ClassScheduleRow,
  ClassScheduleListParams,
  CreateClassScheduleInput,
  UpdateClassScheduleInput,
} from "./lib/class-schedules.types";
