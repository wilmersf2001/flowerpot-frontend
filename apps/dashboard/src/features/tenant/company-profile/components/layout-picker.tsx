"use client";

import { Check } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import type { DocumentLayoutOption } from "../lib/company-profile.types";

/**
 * Selector del formato (diseño) por defecto de los documentos PDF. Es un
 * radiogroup de tarjetas; el diseño real se ve con "Vista previa".
 */
export function LayoutPicker({
  options,
  value,
  onChange,
  disabled,
  error,
}: {
  options: DocumentLayoutOption[];
  value: string;
  onChange: (key: string) => void;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        role="radiogroup"
        aria-label="Formato de documento"
        className="grid gap-3 sm:grid-cols-2"
      >
        {options.map((option) => {
          const selected = option.key === value;
          return (
            <button
              key={option.key}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(option.key)}
              className={cn(
                "group flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-60",
                selected
                  ? "border-primary bg-primary/5"
                  : "hover:border-foreground/30 hover:bg-muted/50",
              )}
            >
              <LayoutThumb layout={option.key} selected={selected} />
              <span className="flex-1 text-sm font-medium">{option.label}</span>
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input",
                )}
                aria-hidden
              >
                {selected ? <Check className="size-3" /> : null}
              </span>
            </button>
          );
        })}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

/** Miniatura esquemática de una hoja; `modern` lleva la franja lateral. */
function LayoutThumb({ layout, selected }: { layout: string; selected: boolean }) {
  const modern = layout === "modern";
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex h-14 w-11 shrink-0 flex-col gap-1 overflow-hidden rounded-sm border bg-background p-1.5",
        selected && "border-primary/60",
      )}
    >
      {modern ? (
        <span className="absolute inset-y-0 left-0 w-1.5 bg-primary" />
      ) : null}
      <span
        className={cn(
          "h-1.5 rounded-[1px]",
          modern ? "ml-1.5 w-4 bg-primary/70" : "w-full bg-foreground/50",
        )}
      />
      <span className={cn("h-0.5 bg-muted-foreground/40", modern && "ml-1.5")} />
      <span className={cn("h-0.5 bg-muted-foreground/40", modern && "ml-1.5")} />
      <span className={cn("h-0.5 w-3/4 bg-muted-foreground/40", modern && "ml-1.5")} />
    </span>
  );
}
