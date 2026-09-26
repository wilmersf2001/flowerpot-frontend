"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@repo/ui/button";
import {
  AppDialog,
  Field,
  MultiCombobox,
  useResourceFormSubmit,
} from "@/features/_shared";
import { useBranchOptions } from "@/features/tenant/branches";
import { useUpdateMembershipBranches } from "../lib/memberships.hooks";
import type { MembershipRow } from "../lib/memberships.types";

const FORM_ID = "membership-branches-form";

type BranchesForm = { branches: string[] };

/** De 1 a `max` sedes (el backend valida lo mismo al crear la membresía). */
function branchesSchema(max?: number | null) {
  return z.object({
    branches: z
      .array(z.string())
      .min(1, "Selecciona al menos una sede.")
      .refine(
        (ids) => !max || ids.length <= max,
        `Puedes elegir hasta ${max} sede${max === 1 ? "" : "s"}.`,
      ),
  });
}

/**
 * Cambio de sedes de una membresía de plan `limited`
 * (`PUT /memberships/{id}/branches`): reemplaza las sedes elegidas.
 */
export function MembershipBranchesDialog({
  membership,
  onOpenChangeAction,
}: {
  membership: MembershipRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const open = membership !== null;
  const updateBranches = useUpdateMembershipBranches();
  const branchOptions = useBranchOptions(open);
  const max = membership?.max_branches;

  const schema = useMemo(() => branchesSchema(max), [max]);
  const form = useForm<BranchesForm>({
    resolver: zodResolver(schema),
    defaultValues: { branches: [] },
  });
  const {
    control,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (membership) {
      reset({ branches: (membership.branches ?? []).map((b) => String(b.id)) });
    }
  }, [membership, reset]);

  const onSubmit = form.handleSubmit(
    useResourceFormSubmit<BranchesForm, MembershipRow>({
      form,
      fields: ["branches"],
      submit: (values) =>
        updateBranches.mutateAsync({
          id: membership!.id,
          input: { branches: values.branches.map(Number) },
        }),
      successMessage: () => "Sedes de la membresía actualizadas.",
      errorMessage: "No se pudieron actualizar las sedes.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title="Cambiar sedes"
      description={
        membership
          ? `${membership.member_name || membership.member_id} · ${membership.plan_name}`
          : undefined
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
            {isSubmitting ? "Guardando…" : "Guardar sedes"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field
          label="Sedes"
          htmlFor="membership-branches"
          error={errors.branches?.message}
          hint={
            max
              ? `Elige hasta ${max} sede${max === 1 ? "" : "s"}. Reemplaza las actuales.`
              : "Reemplaza las sedes actuales."
          }
        >
          <Controller
            control={control}
            name="branches"
            render={({ field }) => (
              <MultiCombobox
                id="membership-branches"
                value={field.value}
                onValueChange={field.onChange}
                options={branchOptions.options}
                placeholder="Selecciona las sedes…"
                aria-invalid={errors.branches ? true : undefined}
              />
            )}
          />
        </Field>
      </form>
    </AppDialog>
  );
}
