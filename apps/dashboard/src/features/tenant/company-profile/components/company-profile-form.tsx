"use client";

import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye } from "lucide-react";
import { Button } from "@repo/ui/button";
import { toast } from "@repo/ui/toast";
import {
  SettingsSection,
  pdfErrorMessage,
  TextField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import {
  COMPANY_PROFILE_FORM_FIELDS,
  companyProfileFormSchema,
  companyProfileToForm,
  toUpdateCompanyProfileInput,
  type CompanyProfileForm,
} from "../lib/company-profile.schema";
import {
  usePreviewCompanyProfile,
  useUpdateCompanyProfile,
} from "../lib/company-profile.hooks";
import type { CompanyProfile } from "../lib/company-profile.types";
import { ColorField } from "./color-field";
import { DocumentPreviewDialog } from "./document-preview-dialog";
import { LayoutPicker } from "./layout-picker";


const FORM_ID = "company-profile-form";

/**
 * Formulario de datos de la empresa, colores y formato de documento. Las
 * imágenes se gestionan aparte (`CompanyImageCard`): tienen su propio endpoint.
 */
export function CompanyProfileForm({
  profile,
  canEdit,
}: {
  profile: CompanyProfile;
  canEdit: boolean;
}) {
  const updateProfile = useUpdateCompanyProfile();
  const preview = usePreviewCompanyProfile();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const form = useForm<CompanyProfileForm>({
    resolver: zodResolver(companyProfileFormSchema),
    defaultValues: companyProfileToForm(profile),
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "company");

  // Re-sincroniza cuando el servidor devuelve datos nuevos (guardado, reintento).
  useEffect(() => {
    reset(companyProfileToForm(profile));
  }, [profile, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<CompanyProfileForm, CompanyProfile>({
      form,
      fields: COMPANY_PROFILE_FORM_FIELDS,
      submit: (values) =>
        updateProfile.mutateAsync(toUpdateCompanyProfileInput(values)),
      successMessage: () => "Perfil de empresa actualizado.",
      errorMessage: "No se pudo guardar el perfil de empresa.",
      onSuccess: () => {},
    }),
  );

  const [layout, tradeName, legalName, primaryColor, secondaryColor] = useWatch({
    control,
    name: [
      "document_layout",
      "trade_name",
      "legal_name",
      "primary_color",
      "secondary_color",
    ],
  });
  const layoutLabel = profile.available_layouts.find(
    (option) => option.key === layout,
  )?.label;

  async function openPreview() {
    try {
      const blob = await preview.mutateAsync(layout);
      setPdfUrl(URL.createObjectURL(blob));
    } catch (err) {
      toast.error(
        await pdfErrorMessage(err, "No se pudo generar la vista previa."),
      );
    }
  }

  function closePreview() {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
  }

  return (
    <form
      id={FORM_ID}
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-6"
    >
      <fieldset
        disabled={!canEdit || isSubmitting}
        className="flex min-w-0 flex-col gap-6 border-0 p-0"
      >
        <SettingsSection
          title="Datos de la empresa"
          description="Se imprimen en el encabezado de recibos y contratos."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              {...bind("legal_name")}
              label="Razón social"
              placeholder="Gimnasio Flowerpot S.A.C."
            />
            <TextField
              {...bind("trade_name")}
              label="Nombre comercial"
              placeholder="Flowerpot Gym"
            />
            <TextField {...bind("ruc")} label="RUC" placeholder="20123456789" />
            <TextField
              {...bind("phone")}
              label="Teléfono"
              placeholder="+51 999 999 999"
            />
            <TextField
              {...bind("email")}
              type="email"
              label="Correo"
              placeholder="contacto@gimnasio.com"
            />
            <TextField
              {...bind("address")}
              label="Dirección"
              placeholder="Av. Principal 123"
            />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Representante legal"
          description="Firma los contratos en nombre de la empresa."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              {...bind("legal_rep_name")}
              label="Nombre completo"
              placeholder="Juan Pérez Gómez"
            />
            <TextField
              {...bind("legal_rep_dni")}
              label="DNI"
              placeholder="12345678"
            />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Identidad visual"
          description="Colores y diseño base de todos los documentos PDF."
        >
          <div className="flex flex-col gap-6">
            <BrandStrip
              name={tradeName || legalName}
              primary={primaryColor}
              secondary={secondaryColor}
              logo={profile.images.logo}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                control={control}
                name="primary_color"
                label="Color primario"
                hint="Títulos y acentos."
                disabled={!canEdit}
              />
              <ColorField
                control={control}
                name="secondary_color"
                label="Color secundario"
                hint="Textos de apoyo y detalles."
                disabled={!canEdit}
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Formato de documento</span>
              <Controller
                control={control}
                name="document_layout"
                render={({ field, fieldState }) => (
                  <LayoutPicker
                    options={profile.available_layouts}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!canEdit}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <p className="text-xs text-muted-foreground">
                Algunas plantillas pueden usar un formato propio; este es el
                predeterminado de la empresa.
              </p>
            </div>
          </div>
        </SettingsSection>
      </fieldset>

      <div className="sticky bottom-0 z-10 -mx-6 flex flex-wrap items-center justify-between gap-3 border-t bg-background/95 px-6 py-3 backdrop-blur">
        <Button
          type="button"
          variant="outline"
          onClick={openPreview}
          disabled={preview.isPending}
        >
          <Eye className="size-4" />
          {preview.isPending ? "Generando…" : "Vista previa"}
        </Button>

        {canEdit ? (
          <div className="flex items-center gap-2">
            {isDirty ? (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Cambios sin guardar
              </span>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => reset(companyProfileToForm(profile))}
              disabled={!isDirty || isSubmitting}
            >
              Descartar
            </Button>
            <Button type="submit" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? "Guardando…" : "Guardar cambios"}
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Solo lectura: no tienes permiso para editar la marca.
          </p>
        )}
      </div>

      <DocumentPreviewDialog
        url={pdfUrl}
        layoutLabel={layoutLabel}
        onOpenChangeAction={(open) => {
          if (!open) closePreview();
        }}
      />
    </form>
  );
}

/** Cabecera de muestra: refleja nombre, logo y colores mientras se editan. */
function BrandStrip({
  name,
  primary,
  secondary,
  logo,
}: {
  name: string;
  primary: string;
  secondary: string;
  logo: string | null;
}) {
  const isHex = (value: string) => /^#[0-9A-Fa-f]{6}$/.test(value);
  const primaryColor = isHex(primary) ? primary : "#94a3b8";
  const secondaryColor = isHex(secondary) ? secondary : "#cbd5e1";

  return (
    <div
      className="overflow-hidden rounded-lg border"
      aria-label="Muestra de la marca"
    >
      <div className="h-2" style={{ backgroundColor: primaryColor }} />
      <div className="flex items-center gap-4 bg-card px-4 py-3">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="h-10 w-auto max-w-24 object-contain" />
        ) : (
          <div
            className="flex size-10 items-center justify-center rounded-md text-sm font-semibold text-white"
            style={{ backgroundColor: primaryColor }}
            aria-hidden
          >
            {(name || "?").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p
            className="truncate text-base font-semibold"
            style={{ color: primaryColor }}
          >
            {name || "Nombre de la empresa"}
          </p>
          <p className="text-xs" style={{ color: secondaryColor }}>
            Así se verán los títulos y acentos en tus documentos.
          </p>
        </div>
      </div>
    </div>
  );
}
