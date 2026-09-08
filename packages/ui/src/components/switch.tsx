"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

/**
 * Toggle on/off accesible (Radix). Controlado con `checked` + `onCheckedChange`,
 * o no controlado con `defaultChecked`. Para un toggle que persiste al vuelo
 * (p. ej. `is_active` en una fila de tabla) combínalo con `disabled` mientras
 * la mutación está en curso.
 */
const switchTrack = cva(
  "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
  {
    variants: {
      size: {
        sm: "h-4 w-7",
        md: "h-5 w-9",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const switchThumb = cva(
  "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0",
  {
    variants: {
      size: {
        sm: "size-3 data-[state=checked]:translate-x-3",
        md: "size-4 data-[state=checked]:translate-x-4",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchTrack> {}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(switchTrack({ size }), className)}
    {...props}
  >
    <SwitchPrimitive.Thumb className={cn(switchThumb({ size }))} />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";

export { Switch };
