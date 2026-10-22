import { z } from "zod";
import { boundedText, optionalText } from "@/features/_shared/form-schema";
import { VISIT_PAYMENT_METHODS } from "./walk-in-visits.constants";
import type { DayPassInput } from "./walk-in-visits.types";

/** Formulario de cobro de pase de día: datos del visitante o cobro anónimo. */
export const dayPassFormSchema = z
  .object({
    mode: z.enum(["visitor", "anonymous"]),
    name: optionalText(100),
    phone: z.string().trim(),
    /** Obligatorio al identificar al visitante: `false` también es una respuesta. */
    contact_consent: z.enum(["", "true", "false"]),
    dni: optionalText(20),
    birth_date: z.string(),
    anonymous_reason: optionalText(255),
    payment_method: z.enum(VISIT_PAYMENT_METHODS),
    payment_reference: optionalText(100),
  })
  .superRefine((values, ctx) => {
    if (values.mode === "anonymous") {
      if (!values.anonymous_reason) {
        ctx.addIssue({ code: "custom", path: ["anonymous_reason"], message: "El motivo es obligatorio." });
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

export type DayPassForm = z.infer<typeof dayPassFormSchema>;

export const dayPassFormDefaults: DayPassForm = {
  mode: "visitor",
  name: "",
  phone: "",
  contact_consent: "",
  dni: "",
  birth_date: "",
  anonymous_reason: "",
  payment_method: "cash",
  payment_reference: "",
};

/** Convierte el formulario al cuerpo de `POST /branches/{id}/day-pass` (sin el importe: lo fija el servidor). */
export function toDayPassInput(form: DayPassForm): DayPassInput {
  const base: DayPassInput = {
    payment_method: form.payment_method,
    payment_reference: form.payment_reference || undefined,
  };
  if (form.mode === "anonymous") {
    return { ...base, anonymous: true, anonymous_reason: form.anonymous_reason };
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

export const refundFormSchema = z.object({
  reason: boundedText("El motivo", { max: 100 }),
});
