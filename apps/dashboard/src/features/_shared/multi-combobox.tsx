"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/command";
import type { ComboboxOption } from "@repo/ui/combobox";

export type MultiComboboxProps = {
  value: string[];
  onValueChange: (value: string[]) => void;
  /** Lista fija de opciones (sin paginar). Pensado para catálogos acotados. */
  options: ComboboxOption[];
  searchable?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-invalid"?: boolean | "true" | "false";
};

/**
 * Select múltiple sobre shadcn (Popover + Command) para **listas en duro**
 * acotadas (sedes, roles, etc.). Muestra las opciones elegidas como chips en
 * el disparador. Controlado: `value` / `onValueChange` (envolver con
 * `Controller` de react-hook-form).
 */
export function MultiCombobox({
  value,
  onValueChange,
  options,
  searchable = true,
  placeholder = "Selecciona…",
  searchPlaceholder = "Buscar…",
  emptyText = "Sin resultados.",
  disabled,
  id,
  className,
  "aria-invalid": ariaInvalid,
}: MultiComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const listId = React.useId();
  const selected = options.filter((option) => value.includes(option.value));

  function toggle(optionValue: string) {
    onValueChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue],
    );
  }

  function remove(optionValue: string) {
    onValueChange(value.filter((v) => v !== optionValue));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-controls={listId}
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          disabled={disabled}
          className={cn(
            "flex min-h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "aria-invalid:border-destructive aria-invalid:ring-destructive",
            className,
          )}
        >
          {selected.length === 0 ? (
            <span className="truncate text-muted-foreground">{placeholder}</span>
          ) : (
            <span className="flex flex-1 flex-wrap gap-1">
              {selected.map((option) => (
                <span
                  key={option.value}
                  className="flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-xs"
                >
                  {option.label}
                  <span
                    role="button"
                    tabIndex={-1}
                    aria-label={`Quitar ${option.label}`}
                    className="rounded-sm hover:bg-muted-foreground/20"
                    onClick={(event) => {
                      event.stopPropagation();
                      remove(option.value);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.stopPropagation();
                        remove(option.value);
                      }
                    }}
                  >
                    <X className="size-3" />
                  </span>
                </span>
              ))}
            </span>
          )}
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        id={listId}
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <Command>
          {searchable ? <CommandInput placeholder={searchPlaceholder} /> : null}
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                keywords={[option.label]}
                disabled={option.disabled}
                onSelect={() => toggle(option.value)}
              >
                <Check
                  className={cn(
                    "size-4 shrink-0",
                    value.includes(option.value) ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="flex-1 truncate">{option.label}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
