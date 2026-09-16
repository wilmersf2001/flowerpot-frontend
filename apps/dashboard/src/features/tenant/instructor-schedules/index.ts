export { InstructorSchedulesDialog } from "./components/instructor-schedules-dialog";

export {
  useInstructorSchedules,
  useCreateInstructorSchedule,
  useUpdateInstructorSchedule,
  useDeleteInstructorSchedule,
  useRestoreInstructorSchedule,
} from "./lib/instructor-schedules.hooks";
export { instructorSchedulesApi } from "./lib/instructor-schedules.api";
export type {
  InstructorScheduleRow,
  InstructorScheduleListParams,
  CreateInstructorScheduleInput,
  UpdateInstructorScheduleInput,
} from "./lib/instructor-schedules.types";
