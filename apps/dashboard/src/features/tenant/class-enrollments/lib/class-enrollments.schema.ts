import { z } from "zod";
import { optionalText } from "@/features/_shared/form-schema";
import { ENROLLMENT_PAYMENT_METHODS } from "./class-enrollments.constants";
import type { EnrollInput } from "./class-enrollments.types";

/**
 * Formulario de inscripción. `mode` decide quién ocupa el cupo: un socio
 * (con membresía o clase suelta) o un visitante (siempre clase suelta).
 */
export const enrollFormSchema = z
  .object({
    mode: z.enum(["member", "visitor"]),
    member_id: z.string(),
    /** Solo modo socio: cobrar clase suelta a un socio sin membresía vigente. */
    drop_in: z.boolean(),
    name: optionalText(100),
    phone: z.string().trim(),
    /** Obligatorio al identificar al visitante: `false` también es una respuesta. */
    contact_consent: z.enum(["", "true", "false"]),
    dni: optionalText(20),
    birth_date: z.string(),
    payment_method: z.enum(ENROLLMENT_PAYMENT_METHODS),
    payment_reference: optionalText(100),
    notes: optionalText(500),
  })
  .superRefine((values, ctx) => {
    if (values.mode === "member") {
      if (!values.member_id) {
        ctx.addIssue({ code: "custom", path: ["member_id"], message: "Selecciona un socio." });
      }
      return;
    }
    if (!values.name) {
      ctx.addIssue({ code: "custom", path: ["name"], message: "El nombre es obligatorio." });
    }
    const digits = values.phone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "El teléfono debe tener entre 7 y 15 dígitos." });
    }
    if (values.contact_consent === "") {
      ctx.addIssue({
        code: "custom",
        path: ["contact_consent"],
        message: "Indica si el visitante acepta ser contactado.",
      });
    }
  });

export type EnrollForm = z.infer<typeof enrollFormSchema>;

export const enrollFormDefaults: EnrollForm = {
  mode: "member",
  member_id: "",
  drop_in: false,
  name: "",
  phone: "",
  contact_consent: "",
  dni: "",
  birth_date: "",
  payment_method: "cash",
  payment_reference: "",
  notes: "",
};

/** Campos del formulario a los que se puede asignar un error 422 del backend. */
export const ENROLL_ERROR_FIELD_MAP: Record<string, keyof EnrollForm> = {
  member_id: "member_id",
  "visitor.name": "name",
  "visitor.phone": "phone",
  "visitor.contact_consent": "contact_consent",
  "visitor.dni": "dni",
  "visitor.birth_date": "birth_date",
  payment_method: "payment_method",
  payment_reference: "payment_reference",
  notes: "notes",
};

/** `true` si la inscripción se cobra (clase suelta): siempre con visitante, opcional con socio. */
export function isDropIn(form: EnrollForm): boolean {
  return form.mode === "visitor" || form.drop_in;
}

/** Convierte el formulario al cuerpo de `POST /class-sessions/{id}/enrollments` (el importe lo fija el servidor). */
export function toEnrollInput(form: EnrollForm): EnrollInput {
  const base: EnrollInput = { notes: form.notes || undefined };
  if (isDropIn(form)) {
    base.access_type = "drop_in";
    base.payment_method = form.payment_method;
    base.payment_reference = form.payment_reference || undefined;
  }
  if (form.mode === "member") {
    return { ...base, member_id: Number(form.member_id) };
  }
  return {
    ...base,
    visitor: {
      name: form.name,
      phone: form.phone,
      contact_consent: form.contact_consent === "true",
      dni: form.dni || undefined,
      birth_date: form.birth_date || undefined,
    },
  };
}
