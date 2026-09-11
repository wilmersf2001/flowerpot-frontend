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
import { useCreateMember, useUpdateMember } from "../lib/members.hooks";
import { MEMBER_GENDERS, MEMBER_GENDER_LABELS } from "../lib/members.constants";
import {
  MEMBER_FORM_FIELDS,
  memberFormDefaults,
  memberFormSchema,
  memberToForm,
  toCreateMemberInput,
  toUpdateMemberInput,
  type MemberForm,
} from "../lib/members.schema";
import type { MemberRow } from "../lib/members.types";

const FORM_ID = "member-form";

/** Género: lista fija -> `Combobox` sin buscador. */
const GENDER_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Sin especificar" },
  ...MEMBER_GENDERS.map((gender) => ({ value: gender, label: MEMBER_GENDER_LABELS[gender] })),
];

/**
 * Diálogo de socio. Sin `member` es "Nuevo socio" (POST); con `member` es
 * "Editar socio" (PATCH). Controlado por el padre.
 */
export function MemberFormDialog({
  open,
  member = null,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Socio a editar. `null`/ausente => modo alta. */
  member?: MemberRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = member !== null;
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();

  const form = useForm<MemberForm>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: memberFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "member");

  // Cada vez que se abre, sincroniza con el socio (edición) o limpia (alta).
  useEffect(() => {
    if (open) reset(member ? memberToForm(member) : memberFormDefaults);
  }, [open, member, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<MemberForm, MemberRow>({
      form,
      fields: MEMBER_FORM_FIELDS,
      submit: (values) =>
        member
          ? updateMember.mutateAsync({ id: member.id, input: toUpdateMemberInput(values) })
          : createMember.mutateAsync(toCreateMemberInput(values)),
      successMessage: (values) =>
        `Socio "${values.first_name} ${values.last_name}" ${isEdit ? "actualizado" : "creado"}.`,
      errorMessage: isEdit
        ? "No se pudo actualizar el socio."
        : "No se pudo crear el socio.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar socio" : "Nuevo socio"}
      description={
        isEdit
          ? "Actualiza los datos del socio."
          : "Registra un nuevo socio del gimnasio."
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
                : "Crear socio"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <TextField {...bind("first_name")} label="Nombres" placeholder="Juan" autoFocus />
          <TextField {...bind("last_name")} label="Apellidos" placeholder="Pérez" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextField {...bind("dni")} label="DNI" placeholder="12345678" />
          <DateField
            form={form}
            name="birth_date"
            idPrefix="member"
            label="Fecha de nacimiento"
            toDate={new Date()}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextField {...bind("email")} label="Correo" type="email" placeholder="socio@correo.com" />
          <TextField {...bind("phone")} label="Teléfono" placeholder="+51 999 999 999" />
        </div>

        <Field label="Género" htmlFor="member-gender">
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <Combobox
                id="member-gender"
                value={field.value}
                onValueChange={field.onChange}
                options={GENDER_OPTIONS}
              />
            )}
          />
        </Field>

        <TextField
          {...bind("photo_url")}
          label="URL de foto"
          placeholder="https://…"
          hint="Opcional."
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            {...bind("emergency_contact_name")}
            label="Contacto de emergencia"
            placeholder="Nombre"
          />
          <TextField
            {...bind("emergency_contact_phone")}
            label="Teléfono de emergencia"
            placeholder="+51 999 999 999"
          />
        </div>

        <TextareaField
          {...bind("notes")}
          label="Notas"
          hint="Opcional."
          placeholder="Observaciones, condiciones médicas…"
        />
      </form>
    </AppDialog>
  );
}
