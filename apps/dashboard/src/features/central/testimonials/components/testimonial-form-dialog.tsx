"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import {
  AppDialog,
  TextField,
  TextareaField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import {
  useCreateTestimonial,
  useUpdateTestimonial,
} from "../lib/testimonials.hooks";
import {
  TESTIMONIAL_FORM_FIELDS,
  testimonialFormDefaults,
  testimonialFormSchema,
  testimonialToForm,
  toTestimonialInput,
  type TestimonialForm,
  type TestimonialRow,
} from "../lib/testimonials.lib";

const FORM_ID = "testimonial-form";

export function TestimonialFormDialog({
  open,
  testimonial = null,
  onOpenChangeAction,
}: {
  open: boolean;
  testimonial?: TestimonialRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = testimonial !== null;
  const create = useCreateTestimonial();
  const update = useUpdateTestimonial();

  const form = useForm<TestimonialForm>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: testimonialFormDefaults,
  });
  const {
    handleSubmit,
    reset,
    register,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "testimonial");

  useEffect(() => {
    if (open) {
      reset(
        testimonial ? testimonialToForm(testimonial) : testimonialFormDefaults,
      );
    }
  }, [open, testimonial, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<TestimonialForm, TestimonialRow>({
      form,
      fields: TESTIMONIAL_FORM_FIELDS,
      submit: (values) =>
        testimonial
          ? update.mutateAsync({
              id: testimonial.id,
              input: toTestimonialInput(values),
            })
          : create.mutateAsync(toTestimonialInput(values)),
      successMessage: () =>
        `Testimonio ${isEdit ? "actualizado" : "creado"}.`,
      errorMessage: isEdit
        ? "No se pudo actualizar el testimonio."
        : "No se pudo crear el testimonio.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar testimonio" : "Nuevo testimonio"}
      description="Los publicados y destacados aparecen en la web pública."
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
                : "Crear testimonio"}
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
        <TextField {...bind("author_name")} label="Autor" autoFocus />
        <div className="grid grid-cols-2 gap-4">
          <TextField {...bind("author_role")} label="Cargo" placeholder="Dueño" />
          <TextField {...bind("gym_name")} label="Gimnasio" />
        </div>
        <TextField
          {...bind("author_avatar")}
          label="Avatar (URL)"
          placeholder="https://…"
          hint="Opcional."
        />
        <TextareaField {...bind("content")} label="Testimonio" rows={4} />
        <div className="grid grid-cols-2 gap-4">
          <TextField
            {...bind("rating")}
            label="Estrellas"
            type="number"
            min={1}
            max={5}
            step="1"
          />
          <TextField
            {...bind("sort_order")}
            label="Orden"
            type="number"
            min={0}
            step="1"
            hint="Menor número aparece primero."
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 rounded border-input"
            {...register("is_published")}
          />
          Publicado
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 rounded border-input"
            {...register("is_featured")}
          />
          Destacado en la landing
        </label>
      </form>
    </AppDialog>
  );
}
