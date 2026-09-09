"use client";

import { useCallback, type ComponentProps, type ReactNode } from "react";
import type {
  FieldError,
  FieldValues,
  Path,
  UseFormRegister,
  UseFormReturn,
} from "react-hook-form";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { cn } from "@repo/ui/lib/utils";

/**
 * Primitivas declarativas de formulario para los diálogos del dashboard.
 *
 * `Field` es el andamiaje visual (etiqueta + control + error/pista). Encima
 * van `TextField` / `TextareaField`, que solo reciben lo que cambia entre
 * campos: `name`, `label`, `placeholder`, `hint`… El `id`, el `aria-invalid`,
 * el `autoComplete` y el estilo de solo lectura se derivan solos.
 *
 * `useFieldBinder` ata el `form` una vez y evita repetir `register`/`error`
 * en cada campo: `<TextField {...bind("slug")} label="…" />`.
 */

/* -------------------------------------------------------------------------- */
/*  Field: etiqueta + control + error/pista                                   */
/* -------------------------------------------------------------------------- */

/** Campo del formulario: etiqueta + control + error/pista. */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Binder: ata el form una vez                                               */
/* -------------------------------------------------------------------------- */

/** Props que `useFieldBinder` inyecta en cada `TextField` / `TextareaField`. */
export type FieldBinding<T extends FieldValues> = {
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: FieldError;
  /** Prefijo del `id`/`htmlFor`. Ej: `"plan"` -> `id="plan-slug"`. */
  idPrefix: string;
};

/** `id` estable a partir del prefijo y el nombre del campo (`_` -> `-`). */
function fieldId(prefix: string, name: string) {
  return `${prefix}-${name.replace(/_/g, "-")}`;
}

/**
 * Ata un `useForm(...)` y devuelve un helper que produce las props comunes de
 * un campo. Uso: `const bind = useFieldBinder(form, "plan")` y luego
 * `<TextField {...bind("slug")} label="Identificador" />`.
 */
export function useFieldBinder<T extends FieldValues>(
  form: UseFormReturn<T>,
  idPrefix: string,
): (name: Path<T>) => FieldBinding<T> {
  const { register } = form;
  const { errors } = form.formState;
  return useCallback(
    (name: Path<T>) => ({
      name,
      register,
      idPrefix,
      error: errors[name as keyof typeof errors] as FieldError | undefined,
    }),
    [register, errors, idPrefix],
  );
}

/* -------------------------------------------------------------------------- */
/*  TextField                                                                 */
/* -------------------------------------------------------------------------- */

type TextFieldProps<T extends FieldValues> = FieldBinding<T> & {
  label: string;
  hint?: string;
} & Omit<
    ComponentProps<typeof Input>,
    "id" | "name" | "ref" | "aria-invalid" | "form"
  >;

/**
 * `Field` + `Input` cableado a react-hook-form. El `id` sale de `idPrefix` +
 * `name`; `aria-invalid` y el texto atenuado de solo lectura se aplican solos.
 * Cualquier prop de `<input>` (`type`, `min`, `step`, `maxLength`, `autoFocus`,
 * `className` extra…) pasa tal cual.
 */
export function TextField<T extends FieldValues>({
  name,
  register,
  error,
  idPrefix,
  label,
  hint,
  className,
  readOnly,
  autoComplete = "off",
  ...inputProps
}: TextFieldProps<T>) {
  const id = fieldId(idPrefix, name);
  return (
    <Field label={label} htmlFor={id} error={error?.message} hint={hint}>
      <Input
        id={id}
        readOnly={readOnly}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        className={cn(readOnly && "text-muted-foreground", className)}
        {...register(name)}
        {...inputProps}
      />
    </Field>
  );
}

/* -------------------------------------------------------------------------- */
/*  TextareaField                                                             */
/* -------------------------------------------------------------------------- */

const TEXTAREA_CLASS =
  "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

type TextareaFieldProps<T extends FieldValues> = FieldBinding<T> & {
  label: string;
  hint?: string;
} & Omit<ComponentProps<"textarea">, "id" | "name" | "ref" | "aria-invalid">;

/** `Field` + `<textarea>` cableado a react-hook-form. Misma API que `TextField`. */
export function TextareaField<T extends FieldValues>({
  name,
  register,
  error,
  idPrefix,
  label,
  hint,
  className,
  rows = 3,
  ...rest
}: TextareaFieldProps<T>) {
  const id = fieldId(idPrefix, name);
  return (
    <Field label={label} htmlFor={id} error={error?.message} hint={hint}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={cn(TEXTAREA_CLASS, className)}
        {...register(name)}
        {...rest}
      />
    </Field>
  );
}
