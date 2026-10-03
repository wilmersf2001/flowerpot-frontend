import { z } from "zod";
import { enumFallback, optionalText, requiredText } from "@/features/_shared/form-schema";
import { MEMBER_GENDERS, MEMBER_MAX_AGE, MEMBER_MIN_AGE } from "./members.constants";
import type { CreateMemberInput, MemberRow, UpdateMemberInput } from "./members.types";

const normalizeGender = enumFallback(["", ...MEMBER_GENDERS] as const, "");

/*
 * Mismas reglas que `ValidatesMemberData` en la API. Por ahora solo socios
 * peruanos mayores de edad: DNI de 8 dígitos y celular peruano.
 */

/** Solo letras (con tildes y ñ), espacios, apóstrofo y guion. */
const NAME_REGEX = /^[\p{L}\s'-]+$/u;
const NAME_MESSAGE = "Solo puede contener letras y espacios.";
const PHONE_MESSAGE = "Debe tener 9 dígitos y empezar con 9.";

/** "+51 987 654 321" -> "987654321". Igual que `prepareForValidation` en la API. */
export function normalizePhone(value: string): string {
  return value.replace(/[\s\-()]/g, "").replace(/^\+?51(?=9\d{8}$)/, "");
}

/** Fecha de hoy menos `years` años, en `YYYY-MM-DD` (hora local). */
function yearsAgo(years: number): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Límites del calendario de fecha de nacimiento. */
export function birthDateBounds() {
  return {
    fromDate: new Date(`${yearsAgo(MEMBER_MAX_AGE)}T00:00:00`),
    toDate: new Date(`${yearsAgo(MEMBER_MIN_AGE)}T00:00:00`),
  };
}

function personName(label: string) {
  return requiredText(label)
    .min(2, "Mínimo 2 caracteres.")
    .max(100, "Máximo 100 caracteres.")
    .regex(NAME_REGEX, NAME_MESSAGE);
}

const optionalPhone = z
  .string()
  .trim()
  .refine((value) => value === "" || /^9\d{8}$/.test(normalizePhone(value)), PHONE_MESSAGE);

export const memberFormSchema = z
  .object({
    first_name: personName("El nombre"),
    last_name: personName("El apellido"),
    dni: requiredText("El DNI").regex(/^\d{8}$/, "El DNI debe tener exactamente 8 dígitos."),
    email: z
      .string()
      .trim()
      .max(150, "Máximo 150 caracteres.")
      .refine((value) => value === "" || z.string().email().safeParse(value).success, {
        message: "Ingresa un correo válido.",
      }),
    phone: optionalPhone,
    birth_date: z
      .string()
      .refine((value) => value === "" || value <= yearsAgo(MEMBER_MIN_AGE), {
        message: `El socio debe ser mayor de ${MEMBER_MIN_AGE} años.`,
      })
      .refine((value) => value === "" || value > yearsAgo(MEMBER_MAX_AGE), {
        message: "La fecha de nacimiento no es válida.",
      }),
    gender: z.enum(["", ...MEMBER_GENDERS]),
    photo_url: z
      .string()
      .trim()
      .max(500, "Máximo 500 caracteres.")
      .refine((value) => value === "" || /^https?:\/\/\S+$/i.test(value), {
        message: "Debe empezar con http:// o https://.",
      }),
    emergency_contact_name: z
      .string()
      .trim()
      .max(100, "Máximo 100 caracteres.")
      .refine((value) => value === "" || value.length >= 2, "Mínimo 2 caracteres.")
      .refine((value) => value === "" || NAME_REGEX.test(value), NAME_MESSAGE),
    emergency_contact_phone: optionalPhone,
    notes: optionalText(1000),
  })
  .superRefine((form, ctx) => {
    // El contacto de emergencia va completo (nombre + celular) o no va.
    if (form.emergency_contact_phone && !form.emergency_contact_name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["emergency_contact_name"],
        message: "Indica el nombre del contacto.",
      });
    }
    if (form.emergency_contact_name && !form.emergency_contact_phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["emergency_contact_phone"],
        message: "Indica el celular del contacto.",
      });
    }
    if (
      form.phone &&
      form.emergency_contact_phone &&
      normalizePhone(form.phone) === normalizePhone(form.emergency_contact_phone)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["emergency_contact_phone"],
        message: "Debe ser distinto al celular del socio.",
      });
    }
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
    email: member.email ?? "",
    phone: member.phone ?? "",
    birth_date: member.birth_date ? member.birth_date.slice(0, 10) : "",
    gender: normalizeGender(member.gender ?? ""),
    photo_url: member.photo_url ?? "",
    emergency_contact_name: member.emergency_contact_name ?? "",
    emergency_contact_phone: member.emergency_contact_phone ?? "",
    notes: member.notes ?? "",
  };
}

/** Convierte el formulario validado al cuerpo de `POST /members`. */
export function toCreateMemberInput(form: MemberForm): CreateMemberInput {
  return {
    first_name: form.first_name,
    last_name: form.last_name,
    dni: form.dni,
    email: form.email || null,
    phone: form.phone ? normalizePhone(form.phone) : null,
    birth_date: form.birth_date || null,
    gender: form.gender || null,
    photo_url: form.photo_url || null,
    emergency_contact_name: form.emergency_contact_name || null,
    emergency_contact_phone: form.emergency_contact_phone
      ? normalizePhone(form.emergency_contact_phone)
      : null,
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
    phone: form.phone ? normalizePhone(form.phone) : null,
    birth_date: form.birth_date || null,
    gender: form.gender || null,
    photo_url: form.photo_url || null,
    emergency_contact_name: form.emergency_contact_name || null,
    emergency_contact_phone: form.emergency_contact_phone
      ? normalizePhone(form.emergency_contact_phone)
      : null,
    notes: form.notes || null,
  };
}
