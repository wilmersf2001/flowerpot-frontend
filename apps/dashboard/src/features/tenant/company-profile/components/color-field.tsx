"use client";

import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { Field } from "@/features/_shared";
import { HEX_COLOR_PATTERN } from "../lib/company-profile.constants";

/**
 * Selector de color: muestra de color nativa + campo hexadecimal. Ambos
 * escriben el mismo valor `#RRGGBB` en el formulario.
 */
export function ColorField<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  disabled,
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  hint?: string;
  disabled?: boolean;
}) {
  const id = `company-${String(name).replace(/_/g, "-")}`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value = String(field.value ?? "");
        const valid = HEX_COLOR_PATTERN.test(value);
        return (
          <Field
            label={label}
            htmlFor={id}
            error={fieldState.error?.message}
            hint={hint}
          >
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label={`${label} (selector)`}
                value={valid ? value : "#000000"}
                onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                disabled={disabled}
                className={cn(
                  "size-9 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-0.5",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              />
              <Input
                id={id}
                value={value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                ref={field.ref}
                disabled={disabled}
                maxLength={7}
                placeholder="#0F766E"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={fieldState.error ? true : undefined}
                className="font-mono uppercase"
              />
            </div>
          </Field>
        );
      }}
    />
  );
}
