import { z } from "zod";
import { boundedText, optionalText, requiredText } from "@/features/_shared/form-schema";
import type { CreateStaffInput, StaffRow, UpdateStaffInput } from "./staff.types";

export const staffFormSchema = z.object({
  job_position_id: requiredText("El cargo"),
  first_name: boundedText("Los nombres", { max: 100 }),
  last_name: boundedText("Los apellidos", { max: 100 }),
  dni: boundedText("El DNI", { max: 20 }),
  phone: optionalText(30),
  email: z
    .string()
    .trim()
    .max(255, "Máximo 255 caracteres.")
    .refine((value) => value === "" || z.string().email().safeParse(value).success, {
      message: "Correo inválido.",
    }),
  salary: optionalText(20).refine(
    (value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0),
    "El salario debe ser un número válido.",
  ),
  hire_date: requiredText("La fecha de contratación", "f"),
  branch_ids: z.array(z.string()),
});

export type StaffForm = z.infer<typeof staffFormSchema>;

export const staffFormDefaults: StaffForm = {
  job_position_id: "",
  first_name: "",
  last_name: "",
  dni: "",
  phone: "",
  email: "",
  salary: "",
  hire_date: "",
  branch_ids: [],
};

/** Campos que el backend puede devolver como error de validación. */
export const STAFF_FORM_FIELDS = [
  "job_position_id",
  "first_name",
  "last_name",
  "dni",
  "phone",
  "email",
  "salary",
  "hire_date",
  "branch_ids",
] as const satisfies readonly (keyof StaffForm)[];

/** Prellena el formulario con los datos de un miembro del personal existente (modo edición). */
export function staffToForm(staff: StaffRow): StaffForm {
  return {
    job_position_id: staff.job_position_id ?? "",
    first_name: staff.first_name,
    last_name: staff.last_name,
    dni: staff.dni,
    phone: staff.phone,
    email: staff.email,
    salary: staff.salary,
    hire_date: staff.hire_date ?? "",
    branch_ids: staff.branches.map((branch) => branch.id),
  };
}

/** Convierte el formulario validado al cuerpo de `POST /staff`. */
export function toCreateStaffInput(form: StaffForm): CreateStaffInput {
  return {
    job_position_id: Number(form.job_position_id),
    first_name: form.first_name,
    last_name: form.last_name,
    dni: form.dni,
    phone: form.phone || null,
    email: form.email || null,
    salary: form.salary ? Number(form.salary) : null,
    hire_date: form.hire_date,
    branch_ids: form.branch_ids.map(Number),
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /staff/{staff}`. */
export function toUpdateStaffInput(form: StaffForm): UpdateStaffInput {
  return {
    job_position_id: Number(form.job_position_id),
    first_name: form.first_name,
    last_name: form.last_name,
    dni: form.dni,
    phone: form.phone || null,
    email: form.email || null,
    salary: form.salary ? Number(form.salary) : null,
    hire_date: form.hire_date,
    branch_ids: form.branch_ids.map(Number),
  };
}
