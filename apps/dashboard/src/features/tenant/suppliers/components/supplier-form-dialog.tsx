"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { AppDialog, TextareaField, TextField, useFieldBinder, useResourceFormSubmit } from "@/features/_shared";
import { useCreateSupplier, useUpdateSupplier } from "../lib/suppliers.hooks";
import {
  SUPPLIER_FORM_FIELDS,
  supplierFormDefaults,
  supplierFormSchema,
  supplierToForm,
  toCreateSupplierInput,
  toUpdateSupplierInput,
  type SupplierForm,
} from "../lib/suppliers.schema";
import type { SupplierRow } from "../lib/suppliers.types";

const FORM_ID = "supplier-form";

/**
 * Diálogo de proveedor. Sin `supplier` es "Nuevo proveedor" (POST); con
 * `supplier` es "Editar proveedor" (PATCH). Controlado por el padre.
 */
export function SupplierFormDialog({
  open,
  supplier = null,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Proveedor a editar. `null`/ausente => modo alta. */
  supplier?: SupplierRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = supplier !== null;
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();

  const form = useForm<SupplierForm>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: supplierFormDefaults,
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "supplier");

  // Cada vez que se abre, sincroniza con el proveedor (edición) o limpia (alta).
  useEffect(() => {
    if (open) reset(supplier ? supplierToForm(supplier) : supplierFormDefaults);
  }, [open, supplier, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<SupplierForm, SupplierRow>({
      form,
      fields: SUPPLIER_FORM_FIELDS,
      submit: (values) =>
        supplier
          ? updateSupplier.mutateAsync({
              id: supplier.id,
              input: toUpdateSupplierInput(values),
            })
          : createSupplier.mutateAsync(toCreateSupplierInput(values)),
      successMessage: (values) =>
        `Proveedor "${values.name}" ${isEdit ? "actualizado" : "creado"}.`,
      errorMessage: isEdit
        ? "No se pudo actualizar el proveedor."
        : "No se pudo crear el proveedor.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar proveedor" : "Nuevo proveedor"}
      description={
        isEdit
          ? "Actualiza los datos del proveedor."
          : "Registra la empresa o persona a la que se le compra mercadería o se le contrata un servicio."
      }
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
              ? isEdit
                ? "Guardando…"
                : "Creando…"
              : isEdit
                ? "Guardar cambios"
                : "Crear proveedor"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
          {...bind("name")}
          label="Nombre"
          placeholder="Distribuidora Andina S.A.C."
          autoFocus
        />
        <div className="grid grid-cols-2 gap-4">
          <TextField {...bind("ruc")} label="RUC" placeholder="20123456789" hint="Opcional. Máx. 11 caracteres." maxLength={11} />
          <TextField {...bind("phone")} label="Teléfono" placeholder="987654321" hint="Opcional." />
        </div>
        <TextField
          {...bind("email")}
          label="Correo"
          type="email"
          placeholder="ventas@proveedor.com"
          hint="Opcional."
        />
        <TextareaField
          {...bind("address")}
          label="Dirección"
          placeholder="Av. Los Olivos 123, Lima"
          hint="Opcional."
        />
      </form>
    </AppDialog>
  );
}
