import { z } from "zod";
import { boundedText, numericText, optionalText } from "@/features/_shared/form-schema";
import { CASH_PAYMENT_METHODS } from "./cash-register.constants";
import type {
  CloseCashRegisterInput,
  CreateCashMovementInput,
  OpenCashRegisterInput,
  VoidCashMovementInput,
} from "./cash-register.types";

/** Formulario de apertura de caja (`POST /cash-register/open`). */
export const openCashRegisterFormSchema = z.object({
  opening_amount: numericText("El monto de apertura", { min: 0 }),
  notes: optionalText(500),
});

export type OpenCashRegisterForm = z.infer<typeof openCashRegisterFormSchema>;

export const openCashRegisterFormDefaults: OpenCashRegisterForm = {
  opening_amount: "",
  notes: "",
};

export const OPEN_CASH_REGISTER_FORM_FIELDS = [
  "opening_amount",
  "notes",
] as const satisfies readonly (keyof OpenCashRegisterForm)[];

export function toOpenCashRegisterInput(form: OpenCashRegisterForm): OpenCashRegisterInput {
  return {
    opening_amount: Number(form.opening_amount),
    notes: form.notes || undefined,
  };
}

/** Formulario de cierre de caja (`POST /cash-register/close`). */
export const closeCashRegisterFormSchema = z.object({
  closing_amount: numericText("El conteo de efectivo", { min: 0 }),
  notes: optionalText(500),
});

export type CloseCashRegisterForm = z.infer<typeof closeCashRegisterFormSchema>;

export const closeCashRegisterFormDefaults: CloseCashRegisterForm = {
  closing_amount: "",
  notes: "",
};

export const CLOSE_CASH_REGISTER_FORM_FIELDS = [
  "closing_amount",
  "notes",
] as const satisfies readonly (keyof CloseCashRegisterForm)[];

export function toCloseCashRegisterInput(form: CloseCashRegisterForm): CloseCashRegisterInput {
  return {
    closing_amount: Number(form.closing_amount),
    notes: form.notes || undefined,
  };
}

/**
 * Formulario de movimiento manual (`POST /cash-movements`). `category` es
 * texto libre validado por el backend según `type` — el diálogo restringe las
 * opciones del combobox a la lista correcta (ingreso o egreso), pero el
 * schema solo exige que no esté vacía.
 */
export const cashMovementFormSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().trim().min(1, "La categoría es obligatoria."),
  payment_method: z.enum(CASH_PAYMENT_METHODS),
  amount: numericText("El monto", { min: 0.01 }),
  description: boundedText("La descripción", { min: 3, max: 255 }),
  reference: optionalText(100),
  movement_at: z.string(),
});

export type CashMovementForm = z.infer<typeof cashMovementFormSchema>;

export const cashMovementFormDefaults: CashMovementForm = {
  type: "income",
  category: "",
  payment_method: "cash",
  amount: "",
  description: "",
  reference: "",
  movement_at: "",
};

export const CASH_MOVEMENT_FORM_FIELDS = [
  "type",
  "category",
  "payment_method",
  "amount",
  "description",
  "reference",
  "movement_at",
] as const satisfies readonly (keyof CashMovementForm)[];

export function toCreateCashMovementInput(form: CashMovementForm): CreateCashMovementInput {
  return {
    type: form.type,
    category: form.category,
    payment_method: form.payment_method,
    amount: Number(form.amount),
    description: form.description,
    reference: form.reference || undefined,
    movement_at: form.movement_at || undefined,
  };
}

/** Formulario de anulación de movimiento (`DELETE /cash-movements/{id}`). */
export const voidCashMovementFormSchema = z.object({
  void_reason: boundedText("El motivo", { min: 3, max: 255 }),
});

export type VoidCashMovementForm = z.infer<typeof voidCashMovementFormSchema>;

export const voidCashMovementFormDefaults: VoidCashMovementForm = { void_reason: "" };

export const VOID_CASH_MOVEMENT_FORM_FIELDS = [
  "void_reason",
] as const satisfies readonly (keyof VoidCashMovementForm)[];

export function toVoidCashMovementInput(form: VoidCashMovementForm): VoidCashMovementInput {
  return { void_reason: form.void_reason };
}
