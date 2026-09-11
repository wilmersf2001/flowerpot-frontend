"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { AppDialog, TextField, useFieldBinder, useResourceFormSubmit } from "@/features/_shared";
import { useCreateUser, useUpdateUser } from "../lib/users.hooks";
import {
  USER_FORM_FIELDS,
  userFormDefaults,
  userFormSchema,
  userToForm,
  toCreateUserInput,
  toUpdateUserInput,
  type UserForm,
} from "../lib/users.schema";
import type { UserRow } from "../lib/users.types";

const FORM_ID = "user-form";

/**
 * Diálogo de usuario. Sin `user` es "Nuevo usuario" (POST); con `user` es
 * "Editar usuario" (PUT). Controlado por el padre.
 */
export function UserFormDialog({
  open,
  user = null,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Usuario a editar. `null`/ausente => modo alta. */
  user?: UserRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = user !== null;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const form = useForm<UserForm>({
    resolver: zodResolver(userFormSchema(isEdit)),
    defaultValues: userFormDefaults,
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "user");

  // Cada vez que se abre, sincroniza con el usuario (edición) o limpia (alta).
  useEffect(() => {
    if (open) reset(user ? userToForm(user) : userFormDefaults);
  }, [open, user, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<UserForm, UserRow>({
      form,
      fields: USER_FORM_FIELDS,
      submit: (values) =>
        user
          ? updateUser.mutateAsync({ id: user.id, input: toUpdateUserInput(values) })
          : createUser.mutateAsync(toCreateUserInput(values)),
      successMessage: (values) =>
        `Usuario "${values.name}" ${isEdit ? "actualizado" : "creado"}.`,
      errorMessage: isEdit
        ? "No se pudo actualizar el usuario."
        : "No se pudo crear el usuario.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar usuario" : "Nuevo usuario"}
      description={
        isEdit
          ? "Deja la contraseña en blanco para no cambiarla."
          : "Crea una cuenta de acceso al panel de este gimnasio."
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
                : "Crear usuario"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextField {...bind("name")} label="Nombre" placeholder="Ana Torres" autoFocus />

        <TextField {...bind("email")} label="Email" type="email" placeholder="ana@gimnasio.com" />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            {...bind("password")}
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            hint={isEdit ? "Opcional." : "Mínimo 8 caracteres."}
          />
          <TextField
            {...bind("password_confirmation")}
            label="Confirmar contraseña"
            type="password"
            placeholder="••••••••"
          />
        </div>
      </form>
    </AppDialog>
  );
}
