"use client";

import { useRef, useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { ApiError } from "@repo/api-client";
import { Button } from "@repo/ui/button";
import type { ComboboxOption } from "@repo/ui/combobox";
import { toast } from "@repo/ui/toast";
import { AppDialog, AsyncCombobox, Field, saveBlob } from "@/features/_shared";
import { leadsApi } from "../lib/leads.api";
import { IMPORT_ISSUE_LABELS } from "../lib/leads.constants";
import { useBranchOptions, useImportLeads } from "../lib/leads.hooks";
import type { ImportIssueStatus, ImportLeadsResult } from "../lib/leads.types";

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const ISSUE_ORDER: ImportIssueStatus[] = ["error", "duplicate", "already_member"];

/** Códigos de error del archivo completo (422) → mensaje. El backend ya manda `message` en español. */
function importErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const fileError = err.errors?.file?.[0];
    return fileError ?? err.message;
  }
  return "No se pudo importar el archivo.";
}

/** Importación masiva de leads desde Excel: plantilla, carga e informe por fila. */
export function ImportLeadsDialog({
  open,
  onOpenChangeAction,
}: {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const importLeads = useImportLeads();
  const branchOptions = useBranchOptions(open);
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [branch, setBranch] = useState<ComboboxOption | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportLeadsResult | null>(null);
  const [downloading, setDownloading] = useState(false);

  function reset() {
    setFile(null);
    setBranch(null);
    setFileError(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChangeAction(next);
  }

  function handleFile(selected: File | null) {
    setResult(null);
    if (!selected) return setFile(null);
    if (!selected.name.toLowerCase().endsWith(".xlsx")) {
      setFile(null);
      return setFileError("El archivo debe ser un .xlsx.");
    }
    if (selected.size > MAX_FILE_BYTES) {
      setFile(null);
      return setFileError("El archivo no puede pesar más de 2 MB.");
    }
    setFileError(null);
    setFile(selected);
  }

  async function handleTemplate() {
    setDownloading(true);
    try {
      saveBlob(await leadsApi.downloadTemplate(), "plantilla_importacion_leads.xlsx");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo descargar la plantilla.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleImport() {
    if (!file) return;
    try {
      const data = await importLeads.mutateAsync({
        file,
        branchId: branch ? Number(branch.value) : undefined,
      });
      setResult(data);
      toast.success(`Importación terminada: ${data.summary.created} leads creados.`);
    } catch (err) {
      setFileError(importErrorMessage(err));
    }
  }

  const issues = result?.issues ?? [];

  return (
    <AppDialog
      open={open}
      onOpenChange={handleOpenChange}
      className="max-w-2xl"
      title="Importar leads desde Excel"
      description="Descarga la plantilla, complétala (fila 1 = encabezados) y súbela. Solo `nombre` y `telefono` son obligatorias."
      footer={
        result ? (
          <>
            <Button type="button" variant="outline" onClick={reset}>
              Importar otro archivo
            </Button>
            <Button type="button" onClick={() => handleOpenChange(false)}>
              Cerrar
            </Button>
          </>
        ) : (
          <>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleImport} disabled={!file || importLeads.isPending}>
              {importLeads.isPending ? "Importando…" : "Importar"}
            </Button>
          </>
        )
      }
    >
      <div className="flex flex-col gap-4">
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={handleTemplate}
          disabled={downloading}
        >
          <Download className="size-4" />
          {downloading ? "Descargando…" : "Descargar plantilla"}
        </Button>

        {result ? (
          <>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                ["Filas leídas", result.summary.rows_read],
                ["Creados", result.summary.created],
                ["Duplicados", result.summary.duplicates],
                ["Ya socios", result.summary.already_members],
                ["Errores", result.summary.errors],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border p-3">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="text-lg font-semibold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>

            {issues.length > 0 ? (
              <div className="flex max-h-72 flex-col gap-4 overflow-y-auto">
                {ISSUE_ORDER.map((status) => {
                  const group = issues.filter((issue) => issue.status === status);
                  if (group.length === 0) return null;
                  return (
                    <section key={status} className="flex flex-col gap-2">
                      <h3 className="text-sm font-medium">
                        {IMPORT_ISSUE_LABELS[status]} ({group.length})
                      </h3>
                      <ul className="flex flex-col gap-1.5 text-sm">
                        {group.map((issue) => (
                          <li key={issue.row} className="rounded-md border px-3 py-2">
                            <span className="font-medium">Fila {issue.row}</span>
                            {issue.values.nombre ? ` · ${issue.values.nombre}` : ""}
                            <span className="block text-xs text-muted-foreground">
                              {issue.reasons.join(" ")}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </div>
            ) : null}
          </>
        ) : (
          <>
            <Field label="Archivo (.xlsx, máx. 2 MB)" htmlFor="import-leads-file" error={fileError ?? undefined}>
              <div className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  id="import-leads-file"
                  type="file"
                  accept=".xlsx"
                  className="sr-only"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
                <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
                  <FileSpreadsheet className="size-4" />
                  Elegir archivo
                </Button>
                <span className="truncate text-sm text-muted-foreground">
                  {file?.name ?? "Ningún archivo seleccionado"}
                </span>
              </div>
            </Field>

            <Field
              label="Sede de interés"
              htmlFor="import-leads-branch"
              hint="Opcional. Se asigna a todos los leads del archivo."
            >
              <AsyncCombobox
                id="import-leads-branch"
                value={branch?.value ?? ""}
                onValueChange={(_value, option) => setBranch(option && option.value ? option : null)}
                source={branchOptions}
                selectedOption={branch}
                placeholder="Sin sede"
                searchPlaceholder="Buscar sede…"
                emptyText="Sin sedes."
              />
            </Field>
          </>
        )}
      </div>
    </AppDialog>
  );
}
