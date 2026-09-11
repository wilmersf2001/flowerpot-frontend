"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { AppDialog, TextField, useFieldBinder, useResourceFormSubmit } from "@/features/_shared";
import { useCreateBranch, useUpdateBranch } from "../lib/branches.hooks";
import {
  BRANCH_FORM_FIELDS,
  branchFormDefaults,
  branchFormSchema,
  branchToForm,
  toCreateBranchInput,
  toUpdateBranchInput,
  type BranchForm,
} from "../lib/branches.schema";
import type { BranchRow } from "../lib/branches.types";

const FORM_ID = "branch-form";

/**
 * Diálogo de sede. Sin `branch` es "Nueva sede" (POST); con `branch` es
 * "Editar sede" (PATCH). Controlado por el padre.
 */
export function BranchFormDialog({
  open,
  branch = null,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Sede a editar. `null`/ausente => modo alta. */
  branch?: BranchRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = branch !== null;
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();

  const form = useForm<BranchForm>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: branchFormDefaults,
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "branch");

  // Cada vez que se abre, sincroniza con la sede (edición) o limpia (alta).
  useEffect(() => {
    if (open) reset(branch ? branchToForm(branch) : branchFormDefaults);
  }, [open, branch, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<BranchForm, BranchRow>({
      form,
      fields: BRANCH_FORM_FIELDS,
      submit: (values) =>
        branch
          ? updateBranch.mutateAsync({ id: branch.id, input: toUpdateBranchInput(values) })
          : createBranch.mutateAsync(toCreateBranchInput(values)),
      successMessage: (values) =>
        `Sede "${values.name}" ${isEdit ? "actualizada" : "creada"}.`,
      errorMessage: isEdit
        ? "No se pudo actualizar la sede."
        : "No se pudo crear la sede.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar sede" : "Nueva sede"}
      description={
        isEdit
          ? "Actualiza los datos de contacto de la sede."
          : "Crea una nueva sede para este gimnasio."
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
                : "Crear sede"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextField {...bind("name")} label="Nombre" placeholder="Sede Central" autoFocus />

        <TextField {...bind("address")} label="Dirección" placeholder="Av. Principal 123" />

        <div className="grid grid-cols-2 gap-4">
          <TextField {...bind("phone")} label="Teléfono" placeholder="+51 999 999 999" />
          <TextField {...bind("timezone")} label="Zona horaria" placeholder="America/Lima" />
        </div>
      </form>
    </AppDialog>
  );
}
