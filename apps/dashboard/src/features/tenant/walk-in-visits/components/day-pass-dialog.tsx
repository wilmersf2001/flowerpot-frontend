"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api-client";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import { toast } from "@repo/ui/toast";
import {
  AppDialog,
  DateField,
  Field,
  TextField,
  formatDate,
  formatMoney,
  useFieldBinder,
} from "@/features/_shared";
import { cashPaymentMethodLabel } from "@/features/tenant/cash-register/lib/cash-register.constants";
import { ROUTES } from "@/lib/routes";
import { VISIT_PAYMENT_METHODS } from "../lib/walk-in-visits.constants";
import { useChargeDayPass } from "../lib/walk-in-visits.hooks";
import {
  dayPassFormDefaults,
  dayPassFormSchema,
  toDayPassInput,
  type DayPassForm,
} from "../lib/walk-in-visits.schema";
import type { DayPassInput, MatchCandidate, WalkInVisitRow } from "../lib/walk-in-visits.types";

const FORM_ID = "day-pass-form";

const PAYMENT_OPTIONS: ComboboxOption[] = VISIT_PAYMENT_METHODS.map((method) => ({
  value: method,
  label: cashPaymentMethodLabel(method),
}));

const CONSENT_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Selecciona una opción" },
  { value: "true", label: "Sí acepta ser contactado" },
  { value: "false", label: "No quiere ser contactado" },
];

/** Decisión pendiente de recepción antes de reenviar el cobro. */
type Prompt =
  | { kind: "match"; candidates: MatchCandidate[]; message: string }
  | { kind: "repeat"; previous: WalkInVisitRow[]; message: string }
  | { kind: "cash_register"; message: string };

/** `errors.code` estable (más datos extra) de los errores de negocio de las visitas. */
function businessError(err: unknown) {
  if (!(err instanceof ApiError)) return null;
  const errors = err.body?.errors as unknown as
    | { code?: string; candidates?: MatchCandidate[]; previous_visits?: WalkInVisitRow[] }
    | undefined;
  return errors?.code ? { code: errors.code, ...errors } : null;
}

/**
 * Cobro de pase de día para quien no es socio. El importe lo fija el servidor.
 * Maneja `possible_match` (teléfono compartido), `repeat_today` (segundo pase
 * el mismo día) y `cash_register_required` (sin caja abierta).
 */
export function DayPassDialog({
  open,
  canChargeAnonymous,
  onOpenChangeAction,
}: {
  open: boolean;
  canChargeAnonymous: boolean;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const chargeDayPass = useChargeDayPass();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [overrides, setOverrides] = useState<Partial<DayPassInput>>({});

  const form = useForm<DayPassForm>({
    resolver: zodResolver(dayPassFormSchema),
    defaultValues: dayPassFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "day-pass");
  const mode = useWatch({ control, name: "mode" });

  useEffect(() => {
    if (!open) return;
    reset(dayPassFormDefaults);
  }, [open, reset]);

  /** Al cerrar se descartan las decisiones pendientes del cobro anterior. */
  function handleOpenChange(next: boolean) {
    if (!next) {
      setPrompt(null);
      setOverrides({});
    }
    onOpenChangeAction(next);
  }

  async function send(values: DayPassForm, extra: Partial<DayPassInput>) {
    const input = { ...toDayPassInput(values), ...extra };
    setOverrides(extra);
    setPrompt(null);
    try {
      const visit = await chargeDayPass.mutateAsync(input);
      toast.success(`Pase de día cobrado (${formatMoney(visit.amount)}).`);
      handleOpenChange(false);
    } catch (err) {
      const info = businessError(err);
      if (info?.code === "possible_match") {
        return setPrompt({ kind: "match", candidates: info.candidates ?? [], message: (err as ApiError).message });
      }
      if (info?.code === "repeat_today") {
        return setPrompt({ kind: "repeat", previous: info.previous_visits ?? [], message: (err as ApiError).message });
      }
      if (info?.code === "cash_register_required") {
        return setPrompt({ kind: "cash_register", message: (err as ApiError).message });
      }
      if (err instanceof ApiError && err.isValidationError && err.errors) {
        const map: Record<string, keyof DayPassForm> = {
          "visitor.name": "name",
          "visitor.phone": "phone",
          "visitor.contact_consent": "contact_consent",
          "visitor.dni": "dni",
          "visitor.birth_date": "birth_date",
          anonymous_reason: "anonymous_reason",
          payment_method: "payment_method",
          payment_reference: "payment_reference",
        };
        let applied = false;
        for (const [key, messages] of Object.entries(err.errors)) {
          const field = map[key];
          if (field && messages?.[0]) {
            form.setError(field, { message: messages[0] });
            applied = true;
          }
        }
        if (applied) return;
      }
      toast.error(err instanceof ApiError ? err.message : "No se pudo cobrar el pase de día.");
    }
  }

  const onSubmit = handleSubmit((values) => send(values, {}));

  function resolveMatch(choice: MatchCandidate | "new") {
    const values = form.getValues();
    if (choice === "new") return send(values, { new_person: true });
    if (choice.type === "member") return send(values, { member_id: choice.id, anonymous: undefined });
    return send(values, { lead_id: choice.id });
  }

  const busy = isSubmitting || chargeDayPass.isPending;

  return (
    <AppDialog
      open={open}
      onOpenChange={handleOpenChange}
      className="max-w-lg"
      title="Cobrar pase de día"
      description="Entrada por un día para quien no es socio. El importe lo define la sede."
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} disabled={busy || prompt !== null}>
            {busy ? "Cobrando…" : "Cobrar"}
          </Button>
        </>
      }
    >
      {prompt?.kind === "match" ? (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
          <p>{prompt.message}</p>
          <ul className="flex flex-col gap-2">
            {prompt.candidates.map((candidate) => (
              <li key={`${candidate.type}-${candidate.id}`}>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  disabled={busy}
                  onClick={() => resolveMatch(candidate)}
                >
                  Es {candidate.name} ({candidate.type === "member" ? "socio" : "lead"})
                </Button>
              </li>
            ))}
          </ul>
          <Button type="button" variant="secondary" disabled={busy} onClick={() => resolveMatch("new")}>
            Es otra persona
          </Button>
        </div>
      ) : null}

      {prompt?.kind === "repeat" ? (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
          <p>{prompt.message || "Esta persona ya pagó un pase de día hoy en esta sede."}</p>
          {prompt.previous.map((visit) => (
            <p key={visit.id} className="text-xs text-muted-foreground">
              {formatDate(visit.visited_on)} · {formatMoney(visit.amount)} ·{" "}
              {cashPaymentMethodLabel(visit.payment_method)}
            </p>
          ))}
          <div className="flex gap-2">
            <Button
              type="button"
              disabled={busy}
              onClick={() => send(form.getValues(), { ...overrides, confirm_repeat: true })}
            >
              Sí, es un segundo ingreso
            </Button>
            <Button type="button" variant="outline" onClick={() => setPrompt(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : null}

      {prompt?.kind === "cash_register" ? (
        <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {prompt.message || "No hay una caja abierta en esta sede."}{" "}
          <Link href={ROUTES.tenant.cashRegister} className="underline underline-offset-2">
            Abrir caja
          </Link>
        </div>
      ) : null}

      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {canChargeAnonymous ? (
          <label className="flex items-center gap-2 text-sm">
            <Controller
              control={control}
              name="mode"
              render={({ field }) => (
                <input
                  type="checkbox"
                  className="size-4 rounded border-input"
                  checked={field.value === "anonymous"}
                  onChange={(e) => field.onChange(e.target.checked ? "anonymous" : "visitor")}
                />
              )}
            />
            Cobrar sin datos del visitante
          </label>
        ) : null}

        {mode === "anonymous" ? (
          <TextField {...bind("anonymous_reason")} label="Motivo" placeholder="No quiso dar datos" autoFocus />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <TextField {...bind("name")} label="Nombre" placeholder="Carlos Ramos" autoFocus />
              <TextField {...bind("phone")} label="Teléfono" placeholder="987 654 321" />
            </div>
            <Field label="Consentimiento de contacto" htmlFor="day-pass-contact-consent" error={errors.contact_consent?.message}>
              <Controller
                control={control}
                name="contact_consent"
                render={({ field }) => (
                  <Combobox
                    id="day-pass-contact-consent"
                    value={field.value}
                    onValueChange={field.onChange}
                    options={CONSENT_OPTIONS}
                    aria-invalid={errors.contact_consent ? true : undefined}
                  />
                )}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <TextField {...bind("dni")} label="DNI" hint="Opcional." placeholder="12345678" />
              <DateField
                form={form}
                name="birth_date"
                idPrefix="day-pass"
                label="Fecha de nacimiento"
                hint="Opcional."
                toDate={new Date()}
              />
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Método de pago" htmlFor="day-pass-payment-method" error={errors.payment_method?.message}>
            <Controller
              control={control}
              name="payment_method"
              render={({ field }) => (
                <Combobox
                  id="day-pass-payment-method"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={PAYMENT_OPTIONS}
                />
              )}
            />
          </Field>
          <TextField {...bind("payment_reference")} label="Referencia" hint="Nº de operación (opcional)." />
        </div>
      </form>
    </AppDialog>
  );
}
