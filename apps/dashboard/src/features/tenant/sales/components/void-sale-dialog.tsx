"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@repo/ui/button";
import { AppDialog, TextareaField, useFieldBinder, useResourceFormSubmit } from "@/features/_shared";
import { boundedText } from "@/features/_shared/form-schema";
import { useVoidSale } from "../lib/sales.hooks";
import type { SaleRow } from "../lib/sales.types";

const FORM_ID = "void-sale-form";

const voidSaleFormSchema = z.object({
  void_reason: boundedText("El motivo de anulación", { min: 3, max: 500 }),
});

type VoidSaleForm = z.infer<typeof voidSaleFormSchema>;

const VOID_SALE_FORM_FIELDS = ["void_reason"] as const satisfies readonly (keyof VoidSaleForm)[];

const voidSaleFormDefaults: VoidSaleForm = { void_reason: "" };

/**
 * Diálogo de anulación de venta (`PATCH /sales/{id}/void`). Solo válido si la
 * venta está `completed`. Repone el stock y revierte el ingreso en caja.
 */
export function VoidSaleDialog({
  sale,
  onOpenChangeAction,
}: {
  sale: SaleRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const voidSale = useVoidSale();
  const open = sale !== null;

  const form = useForm<VoidSaleForm>({
    resolver: zodResolver(voidSaleFormSchema),
    defaultValues: voidSaleFormDefaults,
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "void-sale");

  useEffect(() => {
    if (open) reset(voidSaleFormDefaults);
  }, [open, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<VoidSaleForm, SaleRow>({
      form,
      fields: VOID_SALE_FORM_FIELDS,
      submit: (values) => {
        if (!sale) throw new Error("No hay venta seleccionada.");
        return voidSale.mutateAsync({ id: sale.id, input: { void_reason: values.void_reason } });
      },
      successMessage: () => "Venta anulada. El stock ya se repuso.",
      errorMessage: "No se pudo anular la venta.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title="Anular venta"
      description="Se repondrá el stock vendido y se revertirá el ingreso en caja (si existía). Esta acción no se puede deshacer."
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChangeAction(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} variant="destructive" disabled={isSubmitting}>
            {isSubmitting ? "Anulando…" : "Anular venta"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextareaField
          {...bind("void_reason")}
          label="Motivo de anulación"
          placeholder="Cliente devolvió el producto…"
          autoFocus
        />
      </form>
    </AppDialog>
  );
}
