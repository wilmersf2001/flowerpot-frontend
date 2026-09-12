import { z } from "zod";
import { boundedText, numericText, optionalText, requiredText } from "@/features/_shared/form-schema";
import { EXPENSE_PAYMENT_METHODS } from "./expenses.constants";
import type {
  CreateExpenseInput,
  ExpenseRow,
  ReviewExpenseInput,
  UpdateExpenseInput,
  VoidExpenseInput,
} from "./expenses.types";

/** Formulario de alta/edición de gasto (`POST /expenses`, `PATCH /expenses/{id}`). */
export const expenseFormSchema = z.object({
  expense_category_id: requiredText("La categoría"),
  amount: numericText("El monto", { min: 0.01 }),
  description: boundedText("La descripción", { min: 3, max: 255 }),
  payment_method: z.enum(EXPENSE_PAYMENT_METHODS),
  date: z.string().trim().min(1, "La fecha es obligatoria."),
  reference_number: optionalText(100),
  notes: optionalText(500),
});

export type ExpenseForm = z.infer<typeof expenseFormSchema>;

export const expenseFormDefaults: ExpenseForm = {
  expense_category_id: "",
  amount: "",
  description: "",
  payment_method: "cash",
  date: "",
  reference_number: "",
  notes: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const EXPENSE_FORM_FIELDS = [
  "expense_category_id",
  "amount",
  "description",
  "payment_method",
  "date",
  "reference_number",
  "notes",
] as const satisfies readonly (keyof ExpenseForm)[];

/** Prellena el formulario con los datos de un gasto existente (modo edición, solo `pending`). */
export function expenseToForm(expense: ExpenseRow): ExpenseForm {
  return {
    expense_category_id: expense.expense_category_id,
    amount: String(expense.amount),
    description: expense.description,
    payment_method: expense.payment_method,
    date: expense.date.slice(0, 10),
    reference_number: expense.reference_number ?? "",
    notes: expense.notes ?? "",
  };
}

/** Convierte el formulario validado al cuerpo de `POST /expenses`. */
export function toCreateExpenseInput(form: ExpenseForm): CreateExpenseInput {
  return {
    expense_category_id: Number(form.expense_category_id),
    amount: Number(form.amount),
    description: form.description,
    payment_method: form.payment_method,
    date: form.date,
    reference_number: form.reference_number || undefined,
    notes: form.notes || undefined,
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /expenses/{id}`. */
export function toUpdateExpenseInput(form: ExpenseForm): UpdateExpenseInput {
  return {
    expense_category_id: Number(form.expense_category_id),
    amount: Number(form.amount),
    description: form.description,
    payment_method: form.payment_method,
    date: form.date,
    reference_number: form.reference_number || undefined,
    notes: form.notes || undefined,
  };
}

/** Formulario de revisión (`POST /expenses/{id}/review`): aprobar o rechazar. */
export const expenseReviewFormSchema = z
  .object({
    action: z.enum(["approve", "reject"]),
    notes: optionalText(500),
  })
  .refine((form) => form.action !== "reject" || form.notes.trim().length > 0, {
    message: "Las notas son obligatorias al rechazar.",
    path: ["notes"],
  });

export type ExpenseReviewForm = z.infer<typeof expenseReviewFormSchema>;

export const EXPENSE_REVIEW_FORM_FIELDS = [
  "action",
  "notes",
] as const satisfies readonly (keyof ExpenseReviewForm)[];

export function toReviewExpenseInput(form: ExpenseReviewForm): ReviewExpenseInput {
  return { action: form.action, notes: form.notes || undefined };
}

/** Formulario de anulación (`POST /expenses/{id}/void`). */
export const expenseVoidFormSchema = z.object({
  void_reason: boundedText("El motivo", { min: 3, max: 255 }),
});

export type ExpenseVoidForm = z.infer<typeof expenseVoidFormSchema>;

export const expenseVoidFormDefaults: ExpenseVoidForm = { void_reason: "" };

export const EXPENSE_VOID_FORM_FIELDS = [
  "void_reason",
] as const satisfies readonly (keyof ExpenseVoidForm)[];

export function toVoidExpenseInput(form: ExpenseVoidForm): VoidExpenseInput {
  return { void_reason: form.void_reason };
}
