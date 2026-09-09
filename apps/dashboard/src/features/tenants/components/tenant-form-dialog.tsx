"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { Button } from "@repo/ui/button";
import { AppDialog, TextField, useFieldBinder } from "@/features/_shared";
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
    setError,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "tenant");

  // Cada vez que se abre, empieza limpio.
  useEffect(() => {
    if (open) reset({ id: "" });
  }, [open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await createTenant.mutateAsync(values);
      toast.success(`Gimnasio "${values.id}" creado.`);
      onOpenChangeAction(false);
      onCreatedAction(result);
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.isValidationError &&
        err.errors?.id?.[0]
      ) {
        setError("id", { message: err.errors.id[0] });
        return;
      }
      const message =
        err instanceof ApiError ? err.message : "No se pudo crear el gimnasio.";
      setError("id", { message });
    }
  });

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
