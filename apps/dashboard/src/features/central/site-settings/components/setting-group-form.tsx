"use client";

import { useState } from "react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { toast } from "@repo/ui/toast";
import { SettingsSection } from "@/features/_shared";
import {
  useSaveSetting,
  useSetting,
  type SettingField,
  type SettingGroup,
  type SettingValue,
} from "../lib/site-settings.lib";

const TEXTAREA_CLASS =
  "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

/** ISO (UTC) -> valor de `<input type="datetime-local">` en hora local. */
function isoToLocal(iso: unknown): string {
  const d = typeof iso === "string" ? new Date(iso) : null;
  if (!d || Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDraft(fields: SettingField[], value: SettingValue) {
  const draft: Record<string, string | boolean> = {};
  for (const f of fields) {
    const v = value[f.name];
    if (f.type === "checkbox") draft[f.name] = v === true;
    else if (f.type === "datetime") draft[f.name] = isoToLocal(v);
    else if (f.type === "color")
      draft[f.name] = typeof v === "string" ? v : "#000000";
    else draft[f.name] = v == null ? "" : String(v);
  }
  return draft;
}

function toValue(
  fields: SettingField[],
  draft: Record<string, string | boolean>,
): SettingValue {
  const value: SettingValue = {};
  for (const f of fields) {
    const v = draft[f.name];
    if (f.type === "checkbox") value[f.name] = v === true;
    else if (f.type === "number") value[f.name] = v === "" ? null : Number(v);
    else if (f.type === "datetime")
      value[f.name] = v ? new Date(String(v)).toISOString() : null;
    else value[f.name] = String(v).trim();
  }
  return value;
}

export function SettingGroupForm({ group }: { group: SettingGroup }) {
  const setting = useSetting(group.key);

  return (
    <SettingsSection title={group.title} description={group.description}>
      {setting.isError ? (
        <p className="text-sm text-destructive">
          No se pudo cargar esta configuración.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => setting.refetch()}
          >
            Reintentar
          </button>
        </p>
      ) : setting.data ? (
        <GroupFields group={group} initial={setting.data} />
      ) : (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      )}
    </SettingsSection>
  );
}

/** El borrador se inicializa una vez con lo guardado (se monta ya con datos). */
function GroupFields({
  group,
  initial,
}: {
  group: SettingGroup;
  initial: SettingValue;
}) {
  const save = useSaveSetting(group.key);
  const [draft, setDraft] = useState(() => toDraft(group.fields, initial));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    save.mutate(toValue(group.fields, draft), {
      onSuccess: () => toast.success(`${group.title} guardado.`),
      onError: () =>
        toast.error(`No se pudo guardar ${group.title.toLowerCase()}.`),
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {group.fields.map((f) => {
          const id = `${group.key}-${f.name}`;
          const set = (v: string | boolean) =>
            setDraft((d) => ({ ...d, [f.name]: v }));

          if (f.type === "checkbox") {
            return (
              <label
                key={f.name}
                htmlFor={id}
                className="flex items-center gap-2 text-sm sm:col-span-2"
              >
                <input
                  id={id}
                  type="checkbox"
                  className="size-4 rounded border-input"
                  checked={draft[f.name] === true}
                  onChange={(e) => set(e.target.checked)}
                />
                {f.label}
              </label>
            );
          }

          return (
            <div
              key={f.name}
              className={`flex flex-col gap-1.5 ${f.type === "textarea" ? "sm:col-span-2" : ""}`}
            >
              <Label htmlFor={id}>{f.label}</Label>
              {f.type === "textarea" ? (
                <textarea
                  id={id}
                  rows={3}
                  className={TEXTAREA_CLASS}
                  value={String(draft[f.name] ?? "")}
                  onChange={(e) => set(e.target.value)}
                />
              ) : (
                <Input
                  id={id}
                  type={
                    f.type === "datetime"
                      ? "datetime-local"
                      : f.type === "text"
                        ? "text"
                        : f.type
                  }
                  placeholder={f.placeholder}
                  autoComplete="off"
                  value={String(draft[f.name] ?? "")}
                  onChange={(e) => set(e.target.value)}
                />
              )}
              {f.hint ? (
                <p className="text-xs text-muted-foreground">{f.hint}</p>
              ) : null}
            </div>
          );
        })}
      </div>
      <div>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
