import { z } from "zod";
import { boundedText, optionalText } from "@/features/_shared/form-schema";
import { LEAD_INTERESTS } from "./leads.constants";
import type { ConvertLeadInput, CreateLeadInput, LeadRow, UpdateLeadInput } from "./leads.types";

const emailField = z
  .string()
  .trim()
  .max(100, "Máximo 100 caracteres.")
  .refine((v) => v === "" || z.string().email().safeParse(v).success, { message: "Correo inválido." });

export const leadFormSchema = z.object({
  name: boundedText("El nombre", { max: 100 }),
  phone: boundedText("El teléfono", { max: 20 }),
  email: emailField,
  dni: optionalText(20),
  birth_date: z.string(),
  /** `""` = nunca se preguntó. */
  contact_consent: z.enum(["", "true", "false"]),
  source_detail: optionalText(60),
  interest: z.string(),
  notes: optionalText(1000),
  branch_id: z.string(),
});

export type LeadForm = z.infer<typeof leadFormSchema>;

export const leadFormDefaults: LeadForm = {
  name: "",
  phone: "",
  email: "",
  dni: "",
  birth_date: "",
  contact_consent: "",
  source_detail: "",
  interest: "",
  notes: "",
  branch_id: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const LEAD_FORM_FIELDS = [
  "name",
  "phone",
  "email",
  "dni",
  "birth_date",
  "contact_consent",
  "source_detail",
  "interest",
  "notes",
  "branch_id",
] as const satisfies readonly (keyof LeadForm)[];

export function leadToForm(lead: LeadRow): LeadForm {
  return {
    name: lead.name,
    phone: lead.phone,
    email: lead.email ?? "",
    dni: lead.dni ?? "",
    birth_date: lead.birth_date ?? "",
    contact_consent: lead.contact_consent == null ? "" : lead.contact_consent ? "true" : "false",
    source_detail: lead.source_detail ?? "",
    interest: lead.interest ?? "",
    notes: lead.notes ?? "",
    branch_id: lead.branch ? String(lead.branch.id) : "",
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /leads/{id}`. */
export function toUpdateLeadInput(form: LeadForm): UpdateLeadInput {
  return {
    name: form.name,
    phone: form.phone,
    email: form.email || null,
    dni: form.dni || null,
    birth_date: form.birth_date || null,
    contact_consent: form.contact_consent === "" ? null : form.contact_consent === "true",
    source_detail: form.source_detail || null,
    interest: LEAD_INTERESTS.find((i) => i === form.interest) ?? null,
    notes: form.notes || null,
    branch_id: form.branch_id ? Number(form.branch_id) : null,
  };
}

/** Convierte el formulario validado al cuerpo de `POST /leads` (carga manual). */
export function toCreateLeadInput(form: LeadForm): CreateLeadInput {
  return { ...toUpdateLeadInput(form), name: form.name, phone: form.phone, source: "manual" };
}

/* ------------------------------ Convertir ------------------------------ */

export const convertLeadFormSchema = z.object({
  first_name: boundedText("Los nombres", { max: 100 }),
  last_name: boundedText("Los apellidos", { max: 100 }),
  dni: boundedText("El DNI", { max: 10 }),
  phone: boundedText("El teléfono", { max: 20 }),
  email: emailField,
  birth_date: z.string(),
});

export type ConvertLeadForm = z.infer<typeof convertLeadFormSchema>;

export const CONVERT_LEAD_FORM_FIELDS = [
  "first_name",
  "last_name",
  "dni",
  "phone",
  "email",
  "birth_date",
] as const satisfies readonly (keyof ConvertLeadForm)[];

/** Pre-llena el formulario de conversión con los datos del lead. */
export function leadToConvertForm(lead: LeadRow): ConvertLeadForm {
  const [first = "", ...rest] = lead.name.trim().split(/\s+/);
  return {
    first_name: first,
    last_name: rest.join(" "),
    dni: lead.dni ?? "",
    phone: lead.phone,
    email: lead.email ?? "",
    birth_date: lead.birth_date ?? "",
  };
}

export function toConvertLeadInput(form: ConvertLeadForm): ConvertLeadInput {
  return {
    first_name: form.first_name,
    last_name: form.last_name,
    dni: form.dni,
    phone: form.phone,
    email: form.email || null,
    birth_date: form.birth_date || null,
  };
}
