import { z } from "zod";
import { numericText, optionalText, requiredText } from "@/features/_shared/form-schema";
import { PAYMENT_METHODS } from "./payments.constants";
import type {
  CreateInstallmentInput,
  CreatePaymentInput,
  PaymentRow,
  UpdatePaymentInput,
} from "./payments.types";

/**
 * Formulario de alta de pago (`POST /payments`). `payment_method` es el del
 * primer abono; `gateway` no viaja en el formulario, lo deduce el backend.
 */
export const paymentFormSchema = z
  .object({
    membership_id: requiredText("La membresía"),
    amount: numericText("El monto", { min: 0.01 }),
    amount_paid: numericText("El monto pagado", { min: 0.01 }),
    payment_method: z.enum(PAYMENT_METHODS),
    reference_code: optionalText(100),
    notes: optionalText(500),
    paid_at: z.string(),
  })
  .refine((form) => Number(form.amount_paid) <= Number(form.amount), {
    message: "El monto pagado no puede superar el monto del cobro.",
    path: ["amount_paid"],
  });

export type PaymentForm = z.infer<typeof paymentFormSchema>;

export const paymentFormDefaults: PaymentForm = {
  membership_id: "",
  amount: "",
  amount_paid: "",
  payment_method: "cash",
  reference_code: "",
  notes: "",
  paid_at: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const PAYMENT_FORM_FIELDS = [
  "membership_id",
  "amount",
  "amount_paid",
  "payment_method",
  "reference_code",
  "notes",
  "paid_at",
] as const satisfies readonly (keyof PaymentForm)[];

/** Convierte el formulario validado al cuerpo de `POST /payments`. */
export function toCreatePaymentInput(form: PaymentForm): CreatePaymentInput {
  return {
    membership_id: Number(form.membership_id),
    amount: Number(form.amount),
    amount_paid: Number(form.amount_paid),
    payment_method: form.payment_method,
    reference_code: form.reference_code || undefined,
    notes: form.notes || undefined,
    paid_at: form.paid_at || undefined,
  };
}

/**
 * Formulario de abono adicional (`POST /payments/{id}/installments`). Mismas
 * reglas de método de pago que el alta; el monto máximo lo valida el backend
 * contra el saldo pendiente.
 */
export const installmentFormSchema = z.object({
  amount: numericText("El monto", { min: 0.01 }),
  payment_method: z.enum(PAYMENT_METHODS),
  reference_code: optionalText(100),
  notes: optionalText(500),
  paid_at: z.string(),
});

export type InstallmentForm = z.infer<typeof installmentFormSchema>;

export const installmentFormDefaults: InstallmentForm = {
  amount: "",
  payment_method: "cash",
  reference_code: "",
  notes: "",
  paid_at: "",
};

export const INSTALLMENT_FORM_FIELDS = [
  "amount",
  "payment_method",
  "reference_code",
  "notes",
  "paid_at",
] as const satisfies readonly (keyof InstallmentForm)[];

/** Convierte el formulario validado al cuerpo de `POST /payments/{id}/installments`. */
export function toCreateInstallmentInput(form: InstallmentForm): CreateInstallmentInput {
  return {
    amount: Number(form.amount),
    payment_method: form.payment_method,
    reference_code: form.reference_code || undefined,
    notes: form.notes || undefined,
    paid_at: form.paid_at || undefined,
  };
}

/**
 * Formulario de edición (`PATCH /payments/{id}`): solo las notas generales
 * del cobro, los abonos no se tocan desde aquí.
 */
export const paymentNotesFormSchema = z.object({
  notes: optionalText(500),
});

export type PaymentNotesForm = z.infer<typeof paymentNotesFormSchema>;

export function paymentToNotesForm(row: PaymentRow): PaymentNotesForm {
  return { notes: row.notes ?? "" };
}

export const PAYMENT_NOTES_FORM_FIELDS = [
  "notes",
] as const satisfies readonly (keyof PaymentNotesForm)[];

export function toUpdatePaymentInput(form: PaymentNotesForm): UpdatePaymentInput {
  return { notes: form.notes || undefined };
}
