"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcw } from "lucide-react";
import { ApiError } from "@repo/api-client";
import { Button } from "@repo/ui/button";
import { Combobox } from "@repo/ui/combobox";
import { toast } from "@repo/ui/toast";
import {
  AppDialog,
  ConfirmDialog,
  Field,
  TextField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import {
  INHERIT_LAYOUT,
  TEMPLATE_BODY_MAX,
} from "../lib/documents.constants";
import {
  useDocumentTemplate,
  useResetDocumentTemplate,
  useUpdateDocumentTemplate,
} from "../lib/documents.hooks";
import {
  TEMPLATE_FORM_FIELDS,
  createTemplateFormSchema,
  templateToForm,
  toUpdateTemplateInput,
  type DocumentTemplateForm,
} from "../lib/documents.schema";
import type { DocumentTemplate } from "../lib/documents.types";

const FORM_ID = "document-template-form";

/**
 * Editor de una plantilla de documento. Carga el detalle por `type`; mientras
 * llega (o si falla) muestra un diálogo de estado, y luego monta el formulario
 * con el esquema que depende de las variables propias de ese documento.
 */
export function TemplateEditorDialog({
  type,
  label,
  canEdit,
  onOpenChangeAction,
}: {
  /** Tipo a editar. `null` => cerrado. */
  type: string | null;
  label: string;
  canEdit: boolean;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const query = useDocumentTemplate(type);

  if (type === null) return null;

  if (!query.data) {
    return (
      <AppDialog
        open
        onOpenChange={onOpenChangeAction}
        className="max-w-3xl"
        title={label}
        description="Texto y formato del documento."
      >
        {query.isError ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            No se pudo cargar la plantilla.{" "}
            <button
              type="button"
              className="underline underline-offset-2"
              onClick={() => query.refetch()}
            >
              Reintentar
            </button>
          </p>
        ) : (
          <div className="flex flex-col gap-3" aria-busy="true">
            <div className="h-9 animate-pulse rounded-md bg-muted/50" />
            <div className="h-64 animate-pulse rounded-md bg-muted/50" />
          </div>
        )}
      </AppDialog>
    );
  }

  return (
    <TemplateEditorForm
      key={type}
      template={query.data}
      label={label}
      canEdit={canEdit}
      onOpenChangeAction={onOpenChangeAction}
    />
  );
}

function TemplateEditorForm({
  template,
  label,
  canEdit,
  onOpenChangeAction,
}: {
  template: DocumentTemplate;
  label: string;
  canEdit: boolean;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const updateTemplate = useUpdateDocumentTemplate();
  const resetTemplate = useResetDocumentTemplate();
  const [confirmReset, setConfirmReset] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  const schema = useMemo(
    () => createTemplateFormSchema(template.variables.map((v) => v.key)),
    [template.variables],
  );
  const form = useForm<DocumentTemplateForm>({
    resolver: zodResolver(schema),
    defaultValues: templateToForm(template),
  });
  const {
    control,
    handleSubmit,
    reset,
    register,
    setValue,
    formState: { isDirty, isSubmitting, errors },
  } = form;
  const bind = useFieldBinder(form, "template");

  // Re-sincroniza si el servidor devuelve datos nuevos (guardar, restablecer).
  useEffect(() => {
    reset(templateToForm(template));
  }, [template, reset]);

  const layoutOptions = useMemo(
    () => [
      { value: INHERIT_LAYOUT, label: "Usar el de la empresa" },
      ...template.available_layouts.map((o) => ({
        value: o.key,
        label: o.label,
      })),
    ],
    [template.available_layouts],
  );

  const onSubmit = handleSubmit(
    useResourceFormSubmit<DocumentTemplateForm, DocumentTemplate>({
      form,
      fields: TEMPLATE_FORM_FIELDS,
      submit: (values) =>
        updateTemplate.mutateAsync({
          type: template.type,
          input: toUpdateTemplateInput(values),
        }),
      successMessage: () => `${label} actualizado.`,
      errorMessage: "No se pudo guardar la plantilla.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  async function onConfirmReset() {
    try {
      await resetTemplate.mutateAsync(template.type);
      toast.success(`${label} restablecido al texto por defecto.`);
      setConfirmReset(false);
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "No se pudo restablecer la plantilla.",
      );
    }
  }

  /** Inserta el token en la posición del cursor (o reemplaza la selección). */
  function insertVariable(token: string) {
    const el = bodyRef.current;
    const current = form.getValues("body");
    const start = el?.selectionStart ?? current.length;
    const end = el?.selectionEnd ?? current.length;
    const next = current.slice(0, start) + token + current.slice(end);
    setValue("body", next, { shouldDirty: true, shouldValidate: true });
    requestAnimationFrame(() => {
      el?.focus();
      const caret = start + token.length;
      el?.setSelectionRange(caret, caret);
    });
  }

  const { ref: bodyRegisterRef, ...bodyField } = register("body");
  const bodyId = "template-body";

  return (
    <>
      <AppDialog
        open
        onOpenChange={onOpenChangeAction}
        className="max-w-4xl"
        title={label}
        description={
          canEdit
            ? "Edita el título, el texto y el formato. Los cambios aplican a los documentos que se generen desde ahora."
            : "Solo lectura: no tienes permiso para editar las plantillas."
        }
        footer={
          <>
            {canEdit ? (
              <Button
                type="button"
                variant="ghost"
                className="mr-auto text-muted-foreground"
                onClick={() => setConfirmReset(true)}
                disabled={isSubmitting}
              >
                <RotateCcw className="size-4" />
                Restablecer
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChangeAction(false)}
              disabled={isSubmitting}
            >
              {canEdit ? "Cancelar" : "Cerrar"}
            </Button>
            {canEdit ? (
              <Button
                type="submit"
                form={FORM_ID}
                disabled={!isDirty || isSubmitting}
              >
                {isSubmitting ? "Guardando…" : "Guardar cambios"}
              </Button>
            ) : null}
          </>
        }
      >
        <form
          id={FORM_ID}
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <fieldset
            disabled={!canEdit || isSubmitting}
            className="flex min-w-0 flex-col gap-4 border-0 p-0"
          >
            {template.type === "membership_contract" ? (
              <p className="rounded-lg border border-sky-500/30 bg-sky-500/5 px-3 py-2 text-xs text-sky-700 dark:text-sky-300">
                Los cambios se aplicarán a las <strong>nuevas membresías</strong>.
                Los contratos de membresías ya creadas conservan el texto con el
                que se firmaron.
              </p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField {...bind("title")} label="Título" autoFocus />

              <Controller
                control={control}
                name="layout"
                render={({ field }) => (
                  <Field
                    label="Formato"
                    htmlFor="template-layout"
                    hint="«Usar el de la empresa» sigue el formato definido en Empresa y marca."
                  >
                    <Combobox
                      id="template-layout"
                      value={field.value}
                      onValueChange={field.onChange}
                      options={layoutOptions}
                      disabled={!canEdit}
                    />
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
              <Field
                label="Texto"
                htmlFor={bodyId}
                error={errors.body?.message}
                hint="Texto plano. En los contratos, separa las cláusulas con una línea en blanco."
              >
                <textarea
                  id={bodyId}
                  rows={16}
                  maxLength={TEMPLATE_BODY_MAX}
                  aria-invalid={errors.body ? true : undefined}
                  className="flex min-h-64 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-relaxed shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...bodyField}
                  ref={(el) => {
                    bodyRegisterRef(el);
                    bodyRef.current = el;
                  }}
                />
              </Field>

              <VariablePanel
                variables={template.variables}
                disabled={!canEdit}
                onInsert={insertVariable}
              />
            </div>
          </fieldset>
        </form>
      </AppDialog>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title={`Restablecer «${label}»`}
        description="El título y el texto vuelven al valor por defecto y el formato pasa a usar el de la empresa. Esta acción no se puede deshacer."
        confirmLabel="Restablecer"
        destructive
        loading={resetTemplate.isPending}
        onConfirm={onConfirmReset}
      />
    </>
  );
}

/** Panel "Insertar variable": un clic inserta el token en el cursor. */
function VariablePanel({
  variables,
  disabled,
  onInsert,
}: {
  variables: DocumentTemplate["variables"];
  disabled: boolean;
  onInsert: (token: string) => void;
}) {
  return (
    <aside className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">Insertar variable</h3>
      <p className="text-xs text-muted-foreground">
        Se reemplazan al generar el PDF. Una variable sin valor se imprime vacía.
      </p>
      <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto rounded-lg border p-1.5">
        {variables.map((variable) => (
          <li key={variable.key}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onInsert(variable.token)}
              className="flex w-full flex-col rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="font-mono text-xs text-primary">
                {variable.token}
              </span>
              <span className="text-xs text-muted-foreground">
                {variable.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
