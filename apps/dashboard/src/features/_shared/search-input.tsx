"use client";

import { Search, X } from "lucide-react";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";

/**
 * Campo de búsqueda controlado para las barras de filtro de los módulos.
 * No debounce-a: eso es del padre (ver `useDebouncedValue`).
 */
export function SearchInput({
  value,
  onChangeAction,
  placeholder = "Buscar…",
  className,
}: {
  value: string;
  onChangeAction: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full max-w-xs", className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(event) => onChangeAction(event.target.value)}
        placeholder={placeholder}
        className="px-8"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChangeAction("")}
          aria-label="Limpiar búsqueda"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
