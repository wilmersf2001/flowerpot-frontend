"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import {
  AppDialog,
  Field,
  TextField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { permissionGroupLabel } from "../lib/roles.constants";
import { useCreateRole, usePermissionCatalog, useUpdateRole } from "../lib/roles.hooks";
import {
  ROLE_FORM_FIELDS,
  roleFormDefaults,
  roleFormSchema,
  roleToForm,
  toRoleInput,
  type RoleForm,
} from "../lib/roles.schema";
import type { RoleRow } from "../lib/roles.types";

const FORM_ID = "role-form";

/**
 * Diálogo de rol. Sin `role` es "Nuevo rol" (POST); con `role` es "Editar rol"
 * (PATCH). El padre solo debe abrirlo para roles personalizados (`is_custom`);
 * los predeterminados no son editables.
 */
export function RoleFormDialog({
  open,
  role = null,
  onOpenChangeAction,
}: {
  open: boolean;
  role?: RoleRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = role !== null;
  const catalog = usePermissionCatalog();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const form = useForm<RoleForm>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: roleFormDefaults,
  });
  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "role");

  // Cada vez que se abre, sincroniza con el rol (edición) o limpia (alta).
  useEffect(() => {
    if (open) reset(role ? roleToForm(role) : roleFormDefaults);
  }, [open, role, reset]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const permissions = watch("permissions");

  function toggleGroup(names: string[], checked: boolean) {
    const next = { ...permissions };
    for (const name of names) next[name] = checked;
    setValue("permissions", next, { shouldDirty: true, shouldValidate: true });
  }

  const onSubmit = handleSubmit(
    useResourceFormSubmit<RoleForm, RoleRow>({
      form,
      fields: ROLE_FORM_FIELDS,
      submit: (values) =>
        role
          ? updateRole.mutateAsync({ id: role.id, input: toRoleInput(values) })
          : createRole.mutateAsync(toRoleInput(values)),
      successMessage: (values) =>
        `Rol "${values.name}" ${isEdit ? "actualizado" : "creado"}.`,
      errorMessage: isEdit ? "No se pudo actualizar el rol." : "No se pudo crear el rol.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  const groups = Object.entries(catalog.data ?? {});

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-2xl"
      title={isEdit ? "Editar rol" : "Nuevo rol"}
      description="Define el nombre y los permisos que tendrán los usuarios con este rol."
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
                : "Crear rol"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextField {...bind("name")} label="Nombre" placeholder="Entrenador senior" autoFocus />

        <Field
          label="Permisos"
          htmlFor="role-permissions"
          // El error de `.refine()` sobre un `z.record(...)` viene mezclado con
          // `FieldErrorsImpl` (indexado por nombre de permiso), así que RHF
          // tipa `.message` como `FieldError | string`; se filtra a string.
          error={
            typeof errors.permissions?.message === "string"
              ? errors.permissions.message
              : undefined
          }
        >
          <div id="role-permissions" className="flex flex-col gap-4 rounded-md border p-3">
            {catalog.isPending ? (
              <p className="text-sm text-muted-foreground">Cargando permisos…</p>
            ) : (
              groups.map(([group, entries]) => {
                const allChecked =
                  entries.length > 0 && entries.every((p) => permissions[p.name]);
                return (
                  <div key={group} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {permissionGroupLabel(group)}
                      </span>
                      <button
                        type="button"
                        className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                        onClick={() => toggleGroup(entries.map((p) => p.name), !allChecked)}
                      >
                        {allChecked ? "Desmarcar todos" : "Marcar todos"}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {entries.map((permission) => (
                        <label
                          key={permission.name}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            className="size-4 rounded border-input"
                            checked={Boolean(permissions[permission.name])}
                            onChange={(event) =>
                              setValue(
                                `permissions.${permission.name}`,
                                event.target.checked,
                                { shouldDirty: true, shouldValidate: true },
                              )
                            }
                          />
                          {permission.label}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Field>
      </form>
    </AppDialog>
  );
}
