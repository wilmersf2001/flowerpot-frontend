"use client";

import { Controller, type FieldValues, type Path, type UseFormReturn } from "react-hook-form";
import { DatePicker } from "@repo/ui/date-picker";
import { Field } from "./form-field";

/** `id` estable a partir del prefijo y el nombre del campo (`_` -> `-`). */
function fieldId(prefix: string, name: string) {
  return `${prefix}-${name.replace(/_/g, "-")}`;
}

type DateFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: Path<T>;
  /** Prefijo del `id`/`htmlFor`. Ej.: `"subscription"` -> `id="subscription-starts-at"`. */
  idPrefix: string;
  label: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Deshabilita días anteriores a esta fecha en el calendario. */
  fromDate?: Date;
  /** Deshabilita días posteriores a esta fecha en el calendario. */
  toDate?: Date;
};

/**
 * `Field` + `DatePicker` cableado a react-hook-form. Equivalente a `TextField`
 * pero para fechas: el valor viaja como `YYYY-MM-DD` (mismo formato que daba el
 * `<input type="date">`, así los `schema`/`to*Input` no cambian).
 *
 * Al ser un control controlado usa `Controller` internamente, por eso recibe el
 * `form` completo en vez de las props de `useFieldBinder`.
 */
export function DateField<T extends FieldValues>({
  form,
  name,
  idPrefix,
  label,
  hint,
  placeholder,
  disabled,
  fromDate,
  toDate,
}: DateFieldProps<T>) {
  const id = fieldId(idPrefix, name);
  const error = form.formState.errors[name as keyof typeof form.formState.errors];

  return (
    <Field
      label={label}
      htmlFor={id}
      error={(error as { message?: string } | undefined)?.message}
      hint={hint}
    >
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <DatePicker
            id={id}
            value={(field.value as string) ?? ""}
            onValueChange={field.onChange}
            placeholder={placeholder}
            disabled={disabled}
            fromDate={fromDate}
            toDate={toDate}
            aria-invalid={error ? true : undefined}
          />
        )}
      />
    </Field>
  );
}
