"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";

/** Opción de un `Combobox` / `AsyncCombobox`. `value` es lo que viaja al form. */
export type ComboboxOption = {
  value: string;
  label: string;
  /** Texto secundario a la derecha (precio, código, etc.). */
  hint?: string;
  disabled?: boolean;
  /** Términos extra por los que el buscador debe encontrar la opción. */
  keywords?: string[];
};

export type ComboboxProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: ComboboxOption[];
  /** Muestra el campo de búsqueda dentro del desplegable. Por defecto `false`. */
  searchable?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  contentClassName?: string;
  "aria-invalid"?: boolean | "true" | "false";
};

/**
 * Select sobre shadcn (Popover + Command) para **listas en duro**. Con
 * `searchable` añade un buscador local; sin él se comporta como un select.
 * Controlado: `value` / `onValueChange` (pensado para envolver con
 * `Controller` de react-hook-form).
 */
export function Combobox({
  value,
  onValueChange,
  options,
  searchable = false,
  placeholder = "Selecciona…",
  searchPlaceholder = "Buscar…",
  emptyText = "Sin resultados.",
  disabled,
  id,
  className,
  contentClassName,
  "aria-invalid": ariaInvalid,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const listId = React.useId();
  const selected = options.find((option) => option.value === value) ?? null;

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
            "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive",
            className,
          )}
        >
          <span
            className={cn(
              "truncate",
              !selected && "text-muted-foreground",
            )}
          >
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        id={listId}
        className={cn(
          "w-[var(--radix-popover-trigger-width)] p-0",
          contentClassName,
        )}
      >
        <Command>
          {searchable ? (
            <CommandInput placeholder={searchPlaceholder} />
          ) : null}
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                keywords={[option.label, ...(option.keywords ?? [])]}
                disabled={option.disabled}
                onSelect={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "size-4 shrink-0",
                    option.value === value ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="flex-1 truncate">{option.label}</span>
                {option.hint ? (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {option.hint}
                  </span>
                ) : null}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
