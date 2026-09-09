"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
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
import type { AsyncOptions } from "./use-async-options";

export type AsyncComboboxProps = {
  value: string;
  onValueChange: (value: string) => void;
  /** Resultado de `useAsyncOptions` (lo llama el padre). */
  source: AsyncOptions;
  /**
   * Opción ya seleccionada (modo edición): su etiqueta puede no venir en la
   * primera página de resultados, así que se inyecta a mano.
   */
  selectedOption?: ComboboxOption | null;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-invalid"?: boolean | "true" | "false";
};

/**
 * Combobox asíncrono (siempre con buscador). Consulta el `list()` paginado de
 * un modelo vía `useAsyncOptions` y pagina al hacer scroll. Controlado:
 * `value` / `onValueChange` (envolver con `Controller` de react-hook-form).
 */
export function AsyncCombobox({
  value,
  onValueChange,
  source,
  selectedOption,
  placeholder = "Selecciona…",
  searchPlaceholder = "Buscar…",
  emptyText = "Sin resultados.",
  disabled,
  id,
  className,
  "aria-invalid": ariaInvalid,
}: AsyncComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const listId = React.useId();
  const { setSearch, fetchNextPage } = source;

  const options = React.useMemo(() => {
    if (!selectedOption) return source.options;
    if (
      source.options.some((option) => option.value === selectedOption.value)
    ) {
      return source.options;
    }
    return [selectedOption, ...source.options];
  }, [source.options, selectedOption]);

  const selected = options.find((option) => option.value === value) ?? null;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSearch("");
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 48) fetchNextPage();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
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
            "aria-invalid:border-destructive aria-invalid:ring-destructive",
            className,
          )}
        >
          <span
            className={cn("truncate", !selected && "text-muted-foreground")}
          >
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        id={listId}
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={source.search}
            onValueChange={setSearch}
          />
          <CommandList onScroll={handleScroll}>
            {source.isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Cargando…
              </div>
            ) : source.isError ? (
              <div className="py-6 text-center text-sm text-destructive">
                No se pudo cargar la lista.
              </div>
            ) : options.length === 0 ? (
              <CommandEmpty>{emptyText}</CommandEmpty>
            ) : (
              <>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    onSelect={() => {
                      onValueChange(option.value);
                      handleOpenChange(false);
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
                {source.isFetchingNextPage ? (
                  <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />
                    Cargando más…
                  </div>
                ) : null}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
