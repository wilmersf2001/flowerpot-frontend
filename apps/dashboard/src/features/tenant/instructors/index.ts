export { InstructorsPage } from "./instructors-page";

export {
  useInstructors,
  useCreateInstructor,
  useUpdateInstructor,
  useDeleteInstructor,
  useRestoreInstructor,
  useToggleInstructorActive,
} from "./lib/instructors.hooks";
export { instructorsApi } from "./lib/instructors.api";
export type {
  InstructorRow,
  InstructorStaff,
  InstructorSpecialty,
  InstructorListParams,
  CreateInstructorInput,
  UpdateInstructorInput,
} from "./lib/instructors.types";
