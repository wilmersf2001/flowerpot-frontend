"use client";

import { ResourceHeader, SettingsSection } from "@/features/_shared";
import { useHasPermission } from "@/features/tenant/auth";
import { CompanyImageCard } from "./components/company-image-card";
import { CompanyProfileForm } from "./components/company-profile-form";
import {
  COMPANY_IMAGE_TYPES,
  COMPANY_PROFILE_EDIT_PERMISSION,
} from "./lib/company-profile.constants";
import { useCompanyProfile } from "./lib/company-profile.hooks";

export function CompanyProfilePage() {
  const profile = useCompanyProfile();
  const hasPermission = useHasPermission();
  const canEdit = hasPermission(COMPANY_PROFILE_EDIT_PERMISSION);

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Empresa y marca"
        description="Datos legales, colores e imágenes que se usan en los documentos PDF: recibos, contratos y más."
      />

      {profile.isPending ? (
        <ProfileSkeleton />
      ) : profile.isError || !profile.data ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar el perfil de la empresa.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => profile.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <SettingsSection
            title="Imágenes"
            description="PNG o JPG de hasta 1 MB. Se guardan al instante, sin pulsar «Guardar cambios»."
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {COMPANY_IMAGE_TYPES.map((type) => (
                <CompanyImageCard
                  key={type}
                  type={type}
                  src={profile.data.images[type] ?? null}
                  canEdit={canEdit}
                />
              ))}
            </div>
          </SettingsSection>

          <CompanyProfileForm profile={profile.data} canEdit={canEdit} />
        </>
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      {[0, 1, 2].map((key) => (
        <div
          key={key}
          className="h-48 animate-pulse rounded-xl border bg-muted/40"
        />
      ))}
    </div>
  );
}
