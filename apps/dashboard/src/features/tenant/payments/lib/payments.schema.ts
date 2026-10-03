import { z } from "zod";
import { numericText, optionalText, requiredText } from "@/features/_shared/form-schema";
import { localDateOffset } from "@/features/_shared/format";
import { PAYMENT_METHODS, PAYMENT_METHODS_WITH_REFERENCE } from "./payments.constants";
import type {
  CreateInstallmentInput,
  CreatePaymentInput,
  PaymentRow,
  UpdatePaymentInput,
} from "./payments.types";

/*
 * Mismas reglas que `StorePaymentRequest` / `StoreInstallmentRequest` (y el
 * trait `ValidatesPaymentMethod`) en la API.
 */

/** Yape, Plin, transferencia y POS dejan un número de operación verificable. */
function requiresReference(method: string): boolean {
  return (PAYMENT_METHODS_WITH_REFERENCE as readonly string[]).includes(method);
}

const REFERENCE_REQUIRED_MESSAGE =
  "Ingresa el número de operación para pagos con Yape, Plin, transferencia o POS.";

/** Fecha de pago opcional, nunca futura. */
const paidAtField = z
  .string()
  .refine((value) => value === "" || value <= localDateOffset(0), "La fecha de pago no puede ser futura.");

/**
 * Formulario de alta de pago (`POST /payments`). `payment_method` es el del
 * primer abono; `gateway` no viaja en el formulario, lo deduce el backend.
 */
export const paymentFormSchema = z
  .object({
    membership_id: requiredText("La membresía"),
    amount: numericText("El monto", { min: 0.01, decimals: 2 }),
    amount_paid: numericText("El monto pagado", { min: 0.01, decimals: 2 }),
    payment_method: z.enum(PAYMENT_METHODS),
    reference_code: optionalText(100),
    notes: optionalText(500),
    paid_at: paidAtField,
  })
  .refine((form) => Number(form.amount_paid) <= Number(form.amount), {
    message: "El monto pagado no puede superar el monto del cobro.",
    path: ["amount_paid"],
  })
  .refine((form) => !requiresReference(form.payment_method) || form.reference_code !== "", {
    message: REFERENCE_REQUIRED_MESSAGE,
    path: ["reference_code"],
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
 * reglas de método de pago que el alta; el monto no puede superar el saldo
 * pendiente del pago (`balance`). El backend vuelve a validarlo.
 */
export function installmentFormSchema(balance: number) {
  return z
    .object({
      amount: numericText("El monto", { min: 0.01, decimals: 2 }).refine(
        (value) => Number(value) <= balance,
        `El abono no puede superar el saldo pendiente (${balance.toFixed(2)}).`,
      ),
      payment_method: z.enum(PAYMENT_METHODS),
      reference_code: optionalText(100),
      notes: optionalText(500),
      paid_at: paidAtField,
    })
    .refine((form) => !requiresReference(form.payment_method) || form.reference_code !== "", {
      message: REFERENCE_REQUIRED_MESSAGE,
      path: ["reference_code"],
    });
}

export type InstallmentForm = z.infer<ReturnType<typeof installmentFormSchema>>;

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
