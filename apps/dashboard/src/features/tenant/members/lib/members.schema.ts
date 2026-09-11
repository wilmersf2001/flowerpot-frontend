import { z } from "zod";
import { boundedText, enumFallback, optionalText } from "@/features/_shared/form-schema";
import { MEMBER_GENDERS } from "./members.constants";
import type { CreateMemberInput, MemberRow, UpdateMemberInput } from "./members.types";

const normalizeGender = enumFallback(["", ...MEMBER_GENDERS] as const, "");

export const memberFormSchema = z.object({
  first_name: boundedText("El nombre", { max: 100 }),
  last_name: boundedText("El apellido", { max: 100 }),
  dni: boundedText("El DNI", { max: 20 }),
  email: z
    .string()
    .trim()
    .max(255, "Máximo 255 caracteres.")
    .refine((value) => value === "" || z.string().email().safeParse(value).success, {
      message: "Ingresa un correo válido.",
    }),
  phone: optionalText(30),
  birth_date: optionalText(10),
  gender: z.enum(["", ...MEMBER_GENDERS]),
  photo_url: z
    .string()
    .trim()
    .max(2048, "Máximo 2048 caracteres.")
    .refine((value) => value === "" || z.string().url().safeParse(value).success, {
      message: "Ingresa una URL válida.",
    }),
  emergency_contact_name: optionalText(120),
  emergency_contact_phone: optionalText(30),
  notes: optionalText(500),
});

export type MemberForm = z.infer<typeof memberFormSchema>;

export const memberFormDefaults: MemberForm = {
  first_name: "",
  last_name: "",
  dni: "",
  email: "",
  phone: "",
  birth_date: "",
  gender: "",
  photo_url: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  notes: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const MEMBER_FORM_FIELDS = [
  "first_name",
  "last_name",
  "dni",
  "email",
  "phone",
  "birth_date",
  "gender",
  "photo_url",
  "emergency_contact_name",
  "emergency_contact_phone",
  "notes",
] as const satisfies readonly (keyof MemberForm)[];

/** Prellena el formulario con los datos de un socio existente (modo edición). */
export function memberToForm(member: MemberRow): MemberForm {
  return {
    first_name: member.first_name,
    last_name: member.last_name,
    dni: member.dni,
    email: member.email,
    phone: member.phone,
    birth_date: member.birth_date ? member.birth_date.slice(0, 10) : "",
    gender: normalizeGender(member.gender ?? ""),
    photo_url: member.photo_url,
    emergency_contact_name: member.emergency_contact_name,
    emergency_contact_phone: member.emergency_contact_phone,
    notes: member.notes,
  };
}

/** Convierte el formulario validado al cuerpo de `POST /members`. */
export function toCreateMemberInput(form: MemberForm): CreateMemberInput {
  return {
    first_name: form.first_name,
    last_name: form.last_name,
    dni: form.dni,
    email: form.email || null,
    phone: form.phone || null,
    birth_date: form.birth_date || null,
    gender: form.gender || null,
    photo_url: form.photo_url || null,
    emergency_contact_name: form.emergency_contact_name || null,
    emergency_contact_phone: form.emergency_contact_phone || null,
    notes: form.notes || null,
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /members/{id}`. */
export function toUpdateMemberInput(form: MemberForm): UpdateMemberInput {
  return {
    first_name: form.first_name,
    last_name: form.last_name,
    dni: form.dni,
    email: form.email || null,
    phone: form.phone || null,
    birth_date: form.birth_date || null,
    gender: form.gender || null,
    photo_url: form.photo_url || null,
    emergency_contact_name: form.emergency_contact_name || null,
    emergency_contact_phone: form.emergency_contact_phone || null,
    notes: form.notes || null,
  };
}
