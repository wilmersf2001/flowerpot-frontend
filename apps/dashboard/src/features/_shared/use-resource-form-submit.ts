"use client";

import { useCallback } from "react";
import type {
  FieldValues,
  Path,
  UseFormReturn,
} from "react-hook-form";
import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";

/**
 * `onSubmit` de los diálogos de recurso (alta / edición).
 *
 * Los tres diálogos —plan, suscripción, gimnasio— repetían el mismo bloque
 * imperativo: `try` -> mutación -> toast + cerrar; `catch` -> volcar los
 * errores 422 al formulario o mostrar un toast genérico. Este hook lo
 * encapsula: se le pasa qué hacer (`submit`), cómo felicitar (`successMessage`)
 * y qué decir si algo falla, y devuelve un handler listo para
 * `form.handleSubmit(...)`.
 */

export type ResourceFormSubmitConfig<TForm extends FieldValues, TResult> = {
  form: UseFormReturn<TForm>;
  /** Ejecuta la mutación real (create o update) con los valores validados. */
  submit: (values: TForm) => Promise<TResult>;
  /** Texto del toast de éxito. Recibe los valores enviados. */
  successMessage: (values: TForm) => string;
  /** Mensaje de fallback si el error no es de validación por campo. */
  errorMessage: string | ((values: TForm) => string);
  /**
   * Campos que el formulario conoce. Un error 422 sobre un campo de esta
   * lista se pinta en el campo; cualquier otro cae al `errorMessage`.
   */
  fields: readonly Path<TForm>[];
  /** Se llama tras un envío correcto (cerrar diálogo, refrescar, etc.). */
  onSuccess: (result: TResult, values: TForm) => void;
  /**
   * Cómo comunicar el `errorMessage`:
   * - `"toast"` (por defecto): `toast.error(...)`.
   * - `{ field }`: lo pinta en ese campo del formulario (útil en diálogos de
   *   un solo campo, como "Nuevo gimnasio").
   */
  fallback?: "toast" | { field: Path<TForm> };
};

/** Vuelca el bag de validación de Laravel (422) en los campos del formulario. */
function applyValidationErrors<TForm extends FieldValues>(
  form: UseFormReturn<TForm>,
  fields: readonly Path<TForm>[],
  bag: Record<string, string[]>,
): boolean {
  const known = new Set<string>(fields as readonly string[]);
  let applied = false;
  for (const [field, messages] of Object.entries(bag)) {
    if (known.has(field) && messages?.[0]) {
      form.setError(field as Path<TForm>, { message: messages[0] });
      applied = true;
    }
  }
  return applied;
}

export function useResourceFormSubmit<TForm extends FieldValues, TResult>({
  form,
  submit,
  successMessage,
  errorMessage,
  fields,
  onSuccess,
  fallback = "toast",
}: ResourceFormSubmitConfig<TForm, TResult>) {
  return useCallback(
    async (values: TForm) => {
      try {
        const result = await submit(values);
        toast.success(successMessage(values));
        onSuccess(result, values);
      } catch (err) {
        if (err instanceof ApiError && err.isValidationError && err.errors) {
          if (applyValidationErrors(form, fields, err.errors)) return;
        }
        const message =
          err instanceof ApiError
            ? err.message
            : typeof errorMessage === "function"
              ? errorMessage(values)
              : errorMessage;
        if (fallback === "toast") {
          toast.error(message);
        } else {
          form.setError(fallback.field, { message });
        }
      }
    },
    [form, submit, successMessage, errorMessage, fields, onSuccess, fallback],
  );
}
