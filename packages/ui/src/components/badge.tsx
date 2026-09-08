import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

/**
 * Badge presentacional puro. Tres ejes independientes:
 *
 * - `tone`    → el color semántico (neutral, success, warning, danger, info, primary).
 * - `variant` → cómo se rellena ese color (solid, soft, outline).
 * - `size`    → sm | md | lg.
 *
 * No sabe nada de dominio: para mapear un valor (`is_active`, un `status`…) a un
 * tono y una etiqueta, usa `StatusBadge` de `@/features/_shared`, que envuelve
 * este componente con un mapa configurable.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-md border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      tone: {
        neutral: "",
        success: "",
        warning: "",
        danger: "",
        info: "",
        primary: "",
      },
      variant: {
        solid: "border-transparent shadow",
        soft: "border-transparent",
        outline: "bg-transparent",
      },
      size: {
        sm: "px-1.5 py-0 text-[0.6875rem] leading-4",
        md: "px-2 py-0.5 text-xs",
        lg: "px-2.5 py-1 text-sm",
      },
    },
    compoundVariants: [
      // solid
      { tone: "neutral", variant: "solid", class: "bg-secondary text-secondary-foreground" },
      { tone: "primary", variant: "solid", class: "bg-primary text-primary-foreground" },
      { tone: "success", variant: "solid", class: "bg-emerald-600 text-white" },
      { tone: "warning", variant: "solid", class: "bg-amber-500 text-white" },
      { tone: "danger", variant: "solid", class: "bg-destructive text-destructive-foreground" },
      { tone: "info", variant: "solid", class: "bg-sky-600 text-white" },
      // soft
      { tone: "neutral", variant: "soft", class: "bg-muted text-muted-foreground" },
      { tone: "primary", variant: "soft", class: "bg-primary/10 text-primary" },
      {
        tone: "success",
        variant: "soft",
        class:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
      },
      {
        tone: "warning",
        variant: "soft",
        class:
          "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
      },
      {
        tone: "danger",
        variant: "soft",
        class:
          "bg-destructive/10 text-destructive dark:bg-destructive/20",
      },
      {
        tone: "info",
        variant: "soft",
        class: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
      },
      // outline
      { tone: "neutral", variant: "outline", class: "border-border text-foreground" },
      { tone: "primary", variant: "outline", class: "border-primary/40 text-primary" },
      { tone: "success", variant: "outline", class: "border-emerald-500/40 text-emerald-700 dark:text-emerald-300" },
      { tone: "warning", variant: "outline", class: "border-amber-500/40 text-amber-700 dark:text-amber-300" },
      { tone: "danger", variant: "outline", class: "border-destructive/40 text-destructive" },
      { tone: "info", variant: "outline", class: "border-sky-500/40 text-sky-700 dark:text-sky-300" },
    ],
    defaultVariants: { tone: "neutral", variant: "soft", size: "md" },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;
export type BadgeVariant = NonNullable<
  VariantProps<typeof badgeVariants>["variant"]
>;
export type BadgeSize = NonNullable<VariantProps<typeof badgeVariants>["size"]>;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, tone, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ tone, variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
