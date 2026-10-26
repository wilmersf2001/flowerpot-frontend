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
  AsyncCombobox,
  DateField,
  Field,
  TextField,
  formatMoney,
  useFieldBinder,
} from "@/features/_shared";
import { cashPaymentMethodLabel } from "@/features/tenant/cash-register/lib/cash-register.constants";
import { useMemberOptions } from "@/features/tenant/members";
import type { ClassSessionRow } from "@/features/tenant/class-sessions/lib/class-sessions.types";
import { ROUTES } from "@/lib/routes";
import { ENROLLMENT_PAYMENT_METHODS } from "../lib/class-enrollments.constants";
import { useEnroll } from "../lib/class-enrollments.hooks";
import {
  ENROLL_ERROR_FIELD_MAP,
  enrollFormDefaults,
  enrollFormSchema,
  toEnrollInput,
  type EnrollForm,
} from "../lib/class-enrollments.schema";
import type { EnrollInput, EnrollMatchCandidate } from "../lib/class-enrollments.types";

const FORM_ID = "enroll-form";

const MODE_OPTIONS: ComboboxOption[] = [
  { value: "member", label: "Socio" },
  { value: "visitor", label: "Visitante (clase suelta)" },
];

const PAYMENT_OPTIONS: ComboboxOption[] = ENROLLMENT_PAYMENT_METHODS.map((method) => ({
  value: method,
  label: cashPaymentMethodLabel(method),
}));

const CONSENT_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Selecciona una opción" },
  { value: "true", label: "Sí acepta ser contactado" },
  { value: "false", label: "No quiere ser contactado" },
];

/** Decisión pendiente de recepción antes de reenviar la inscripción. */
type Prompt =
  | { kind: "match"; candidates: EnrollMatchCandidate[]; message: string }
  | { kind: "cash_register"; message: string };

/** `errors.code` estable (más datos extra) de los errores de negocio de las inscripciones. */
function businessError(err: unknown) {
  if (!(err instanceof ApiError)) return null;
  const errors = err.body?.errors as unknown as
    | { code?: string; candidates?: EnrollMatchCandidate[] }
    | undefined;
  return errors?.code ? errors : null;
}

/**
 * Inscribe a una persona en una sesión: socio con membresía (pasa a lista de
 * espera si la clase está llena), clase suelta a un socio sin membresía o
 * clase suelta a un visitante. El importe lo fija el servidor.
 */
export function EnrollDialog({
  open,
  session,
  onOpenChangeAction,
}: {
  open: boolean;
  session: ClassSessionRow;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const enroll = useEnroll(session.id);
  const memberOptions = useMemberOptions(open);
  const [prompt, setPrompt] = useState<Prompt | null>(null);

  const form = useForm<EnrollForm>({
    resolver: zodResolver(enrollFormSchema),
    defaultValues: enrollFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "enroll");
  const mode = useWatch({ control, name: "mode" });
  const dropInChecked = useWatch({ control, name: "drop_in" });
  const dropIn = mode === "visitor" || dropInChecked;

  const dropInPrice = session.class_schedule?.gym_class?.drop_in_price;
  const dropInUnavailable = dropInPrice === null;

  useEffect(() => {
    if (open) reset(enrollFormDefaults);
  }, [open, reset]);

  /** Al cerrar se descartan las decisiones pendientes de la inscripción anterior. */
  function handleOpenChange(next: boolean) {
    if (!next) setPrompt(null);
    onOpenChangeAction(next);
  }

  async function send(input: EnrollInput) {
    setPrompt(null);
    try {
      const enrollment = await enroll.mutateAsync(input);
      if (enrollment.status === "waitlisted") {
        toast.success("La clase está llena: quedó en lista de espera.");
      } else if (enrollment.access_type === "drop_in") {
        toast.success(`Clase suelta cobrada (${formatMoney(enrollment.amount_paid)}).`);
      } else {
        toast.success("Inscripción registrada.");
      }
      handleOpenChange(false);
    } catch (err) {
      const info = businessError(err);
      const message = err instanceof ApiError ? err.message : "";
      if (info?.code === "possible_match") {
        return setPrompt({ kind: "match", candidates: info.candidates ?? [], message });
      }
      if (info?.code === "cash_register_required") {
        return setPrompt({ kind: "cash_register", message });
      }
      if (!info && err instanceof ApiError && err.isValidationError && err.errors) {
        let applied = false;
        for (const [key, messages] of Object.entries(err.errors)) {
          const field = ENROLL_ERROR_FIELD_MAP[key];
          if (field && messages?.[0]) {
            form.setError(field, { message: messages[0] });
            applied = true;
          }
        }
        if (applied) return;
      }
      toast.error(message || "No se pudo inscribir.");
    }
  }

  const onSubmit = handleSubmit((values) => send(toEnrollInput(values)));

  /** Reenvía la inscripción ya identificada (sin `visitor`: solo una forma de identificar). */
  function resolveMatch(choice: EnrollMatchCandidate | "new") {
    const values = form.getValues();
    const input = toEnrollInput(values);
    if (choice === "new") return send({ ...input, new_person: true });
    const { visitor: _visitor, ...rest } = input;
    void _visitor;
    if (choice.type === "member") return send({ ...rest, member_id: choice.id });
    return send({ ...rest, lead_id: choice.id });
  }

  const busy = isSubmitting || enroll.isPending;

  return (
    <AppDialog
      open={open}
      onOpenChange={handleOpenChange}
      className="max-w-lg"
      title="Inscribir en la clase"
      description={
        dropIn
          ? dropInPrice
            ? `Clase suelta: se cobra ${formatMoney(dropInPrice)} en la caja abierta de la sede.`
            : "Clase suelta: el importe lo define el precio de la clase."
          : "El socio necesita una membresía pagada y vigente el día de la clase. Si está llena, queda en espera."
      }
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} disabled={busy || prompt !== null}>
            {busy ? "Guardando…" : dropIn ? "Cobrar e inscribir" : "Inscribir"}
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

      {prompt?.kind === "cash_register" ? (
        <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {prompt.message || "No hay una caja abierta en la sede de la clase."}{" "}
          <Link href={ROUTES.tenant.cashRegister} className="underline underline-offset-2">
            Abrir caja
          </Link>
        </div>
      ) : null}

      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field label="Tipo de asistente" htmlFor="enroll-mode">
          <Controller
            control={control}
            name="mode"
            render={({ field }) => (
              <Combobox
                id="enroll-mode"
                value={field.value}
                onValueChange={field.onChange}
                options={MODE_OPTIONS}
              />
            )}
          />
        </Field>

        {mode === "member" ? (
          <>
            <Field label="Socio" htmlFor="enroll-member" error={errors.member_id?.message}>
              <Controller
                control={control}
                name="member_id"
                render={({ field }) => (
                  <AsyncCombobox
                    id="enroll-member"
                    value={field.value}
                    onValueChange={field.onChange}
                    source={memberOptions}
                    placeholder="Selecciona un socio"
                    searchPlaceholder="Buscar por nombre o DNI…"
                    aria-invalid={errors.member_id ? true : undefined}
                  />
                )}
              />
            </Field>
            <label className="flex items-start gap-2 text-sm">
              <Controller
                control={control}
                name="drop_in"
                render={({ field }) => (
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 rounded border-input"
                    checked={field.value}
                    disabled={dropInUnavailable}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
              <span>
                Cobrar clase suelta
                <span className="block text-xs text-muted-foreground">
                  {dropInUnavailable
                    ? "Esta clase no admite clase suelta."
                    : "Solo para socios sin membresía vigente ese día."}
                </span>
              </span>
            </label>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <TextField {...bind("name")} label="Nombre" placeholder="Lucía Ramos" autoFocus />
              <TextField {...bind("phone")} label="Teléfono" placeholder="955 111 222" />
            </div>
            <Field
              label="Consentimiento de contacto"
              htmlFor="enroll-contact-consent"
              error={errors.contact_consent?.message}
            >
              <Controller
                control={control}
                name="contact_consent"
                render={({ field }) => (
                  <Combobox
                    id="enroll-contact-consent"
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
                idPrefix="enroll"
                label="Fecha de nacimiento"
                hint="Opcional."
                toDate={new Date()}
              />
            </div>
          </>
        )}

        {dropIn ? (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Método de pago" htmlFor="enroll-payment-method" error={errors.payment_method?.message}>
              <Controller
                control={control}
                name="payment_method"
                render={({ field }) => (
                  <Combobox
                    id="enroll-payment-method"
                    value={field.value}
                    onValueChange={field.onChange}
                    options={PAYMENT_OPTIONS}
                  />
                )}
              />
            </Field>
            <TextField {...bind("payment_reference")} label="Referencia" hint="Nº de operación (opcional)." />
          </div>
        ) : null}

        <TextField {...bind("notes")} label="Notas" hint="Opcional." />
      </form>
    </AppDialog>
  );
}
