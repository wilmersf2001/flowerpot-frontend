"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import {
  AppDialog,
  DateField,
  Field,
  TextField,
  TextareaField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import {
  useCreatePromotion,
  useUpdatePromotion,
} from "../lib/promotions.hooks";
import {
  PROMOTION_DISCOUNT_TYPES,
  PROMOTION_DISCOUNT_TYPE_LABELS,
} from "../lib/promotions.constants";
import {
  PROMOTION_FORM_FIELDS,
  promotionFormDefaults,
  promotionFormSchema,
  promotionToForm,
  toPromotionInput,
  type PromotionForm,
} from "../lib/promotions.schema";
import type { PromotionRow } from "../lib/promotions.types";

const FORM_ID = "promotion-form";

const TYPE_OPTIONS: ComboboxOption[] = PROMOTION_DISCOUNT_TYPES.map((t) => ({
  value: t,
  label: PROMOTION_DISCOUNT_TYPE_LABELS[t],
}));

export function PromotionFormDialog({
  open,
  promotion = null,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Promoción a editar. `null`/ausente => modo alta. */
  promotion?: PromotionRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = promotion !== null;
  const create = useCreatePromotion();
  const update = useUpdatePromotion();

  const form = useForm<PromotionForm>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: promotionFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    register,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "promotion");

  useEffect(() => {
    if (open) {
      reset(promotion ? promotionToForm(promotion) : promotionFormDefaults);
    }
  }, [open, promotion, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<PromotionForm, PromotionRow>({
      form,
      fields: PROMOTION_FORM_FIELDS,
      submit: (values) =>
        promotion
          ? update.mutateAsync({
              id: promotion.id,
              input: toPromotionInput(values),
            })
          : create.mutateAsync(toPromotionInput(values)),
      successMessage: (values) =>
        `Promoción "${values.code.toUpperCase()}" ${isEdit ? "actualizada" : "creada"}.`,
      errorMessage: isEdit
        ? "No se pudo actualizar la promoción."
        : "No se pudo crear la promoción.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar promoción" : "Nueva promoción"}
      description="Código promocional que se muestra en la web pública mientras esté vigente."
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
          <Button type="submit" form={FORM_ID} disabled={isSubmitting}>
            {isSubmitting
              ? "Guardando…"
              : isEdit
                ? "Guardar cambios"
                : "Crear promoción"}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={onSubmit}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="grid grid-cols-2 gap-4">
          <TextField
            {...bind("code")}
            label="Código"
            placeholder="NAVIDAD2026"
            className="uppercase"
            autoFocus
          />
          <TextField {...bind("name")} label="Nombre" placeholder="Promo Navidad" />
        </div>

        <TextareaField {...bind("description")} label="Descripción" />

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Tipo de descuento"
            htmlFor="promotion-discount-type"
            error={errors.discount_type?.message}
          >
            <Controller
              control={control}
              name="discount_type"
              render={({ field }) => (
                <Combobox
                  id="promotion-discount-type"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={TYPE_OPTIONS}
                />
              )}
            />
          </Field>
          <TextField
            {...bind("discount_value")}
            label="Valor"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            hint="1-100 si es porcentaje; soles si es monto fijo."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DateField form={form} name="valid_from" idPrefix="promotion" label="Válida desde" />
          <DateField
            form={form}
            name="valid_until"
            idPrefix="promotion"
            label="Válida hasta"
            hint="Opcional."
          />
        </div>

        <TextField
          {...bind("max_uses")}
          label="Máximo de usos"
          type="number"
          inputMode="numeric"
          min={1}
          step="1"
          hint="Vacío = ilimitado."
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 rounded border-input"
            {...register("first_time_only")}
          />
          Solo para clientes nuevos
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 rounded border-input"
            {...register("is_active")}
          />
          Promoción activa
        </label>
      </form>
    </AppDialog>
  );
}
