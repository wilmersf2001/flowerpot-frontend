"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";
import { cn } from "../lib/utils";
import { buttonVariants } from "./button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * Calendario sobre `react-day-picker` v9 con el estilado de shadcn/ui y los
 * tokens de Flowerpot. Se usa dentro de `DatePicker` (Popover + Calendar),
 * no directamente en formularios.
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "relative flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        // El caption reserva la fila; `nav` va superpuesto en los extremos.
        // El padding horizontal (2 × ancho de botón) evita que los dropdowns
        // centrados se metan por debajo de los botones de navegación.
        month_caption: "flex items-center justify-center h-9 px-9",
        caption_label: "flex items-center gap-1 text-sm font-medium capitalize",
        // `captionLayout="dropdown"`: cada dropdown es un <span> con un <select>
        // transparente encima y una etiqueta visible (`caption_label`) debajo.
        dropdowns: "flex items-center justify-center gap-1.5",
        dropdown_root:
          "relative inline-flex h-8 items-center rounded-md border border-input px-2 text-sm shadow-sm hover:bg-accent hover:text-accent-foreground focus-within:ring-1 focus-within:ring-ring",
        dropdown: "absolute inset-0 z-10 cursor-pointer appearance-none opacity-0",
        nav: "absolute inset-x-0 top-0 flex h-9 items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-8 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-8 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        month_grid: "w-full border-collapse space-x-1",
        weekdays: "flex justify-between",
        weekday:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] capitalize flex items-center justify-center",
        week: "flex w-full justify-between mt-2",
        day: cn(
          "relative size-8 p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:rounded-md",
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "flex size-8 items-center justify-center p-0 font-normal aria-selected:opacity-100",
        ),
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) =>
          orientation === "left" ? (
            <ChevronLeft
              className={cn("size-4", chevronClassName)}
              {...chevronProps}
            />
          ) : (
            <ChevronRight
              className={cn("size-4", chevronClassName)}
              {...chevronProps}
            />
          ),
      }}
      {...props}
    />
  );
}
