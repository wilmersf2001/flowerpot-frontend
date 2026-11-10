"use client";

import { Controller, type FieldValues, type Path, type UseFormReturn } from "react-hook-form";
import { TimePicker } from "@repo/ui/time-picker";
import { Field } from "./form-field";

/** `id` estable a partir del prefijo y el nombre del campo (`_` -> `-`). */
function fieldId(prefix: string, name: string) {
  return `${prefix}-${name.replace(/_/g, "-")}`;
}

type TimeFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: Path<T>;
  /** Prefijo del `id`/`htmlFor`. Ej.: `"instructor-schedule"`. */
  idPrefix: string;
  label: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Salto de los minutos ofrecidos (por defecto 5). */
  minuteStep?: number;
};

/**
 * `Field` + `TimePicker` cableado a react-hook-form. Equivalente a `DateField`
 * pero para horas: el valor viaja como `HH:MM`, igual que el `<input type="time">`.
 */
export function TimeField<T extends FieldValues>({
  form,
  name,
  idPrefix,
  label,
  hint,
  placeholder,
  disabled,
  minuteStep,
}: TimeFieldProps<T>) {
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
          <TimePicker
            id={id}
            value={(field.value as string) ?? ""}
            onValueChange={field.onChange}
            placeholder={placeholder}
            disabled={disabled}
            minuteStep={minuteStep}
            aria-invalid={error ? true : undefined}
          />
        )}
      />
    </Field>
  );
}
