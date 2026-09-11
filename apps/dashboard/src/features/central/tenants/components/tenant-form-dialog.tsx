"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import {
  AppDialog,
  TextField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { useCreateTenant } from "../lib/tenants.hooks";
import { createTenantSchema, type CreateTenantForm } from "../lib/tenants.schema";
import type { CreateTenantResult } from "../lib/tenants.types";

const FORM_ID = "tenant-form";

/** Diálogo "Nuevo gimnasio". Controlado por el padre. */
export function TenantFormDialog({
  open,
  onOpenChangeAction,
  onCreatedAction,
}: {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  /** Se llama con las credenciales del admin tras crear el gimnasio. */
  onCreatedAction: (result: CreateTenantResult) => void;
}) {
  const createTenant = useCreateTenant();

  const form = useForm<CreateTenantForm>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: { id: "" },
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "tenant");

  // Cada vez que se abre, empieza limpio.
  useEffect(() => {
    if (open) reset({ id: "" });
  }, [open, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<CreateTenantForm, CreateTenantResult>({
      form,
      fields: ["id"],
      submit: (values) => createTenant.mutateAsync(values),
      successMessage: (values) => `Gimnasio "${values.id}" creado.`,
      errorMessage: "No se pudo crear el gimnasio.",
      // Diálogo de un solo campo: cualquier fallo se pinta en "id".
      fallback: { field: "id" },
      onSuccess: (result) => {
        onOpenChangeAction(false);
        onCreatedAction(result);
      },
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      title="Nuevo gimnasio"
      description="El identificador será el subdominio del gimnasio y no se puede cambiar después."
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
            {isSubmitting ? "Creando…" : "Crear gimnasio"}
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
        <TextField
          {...bind("id")}
          label="Identificador"
          placeholder="gymfit"
          autoFocus
          hint="Letras, números, guion y guion bajo."
        />
      </form>
    </AppDialog>
  );
}
