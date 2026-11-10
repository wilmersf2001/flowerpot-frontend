"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, UserPlus, UserX, X } from "lucide-react";
import { ApiError } from "@repo/api-client";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import { toast } from "@repo/ui/toast";
import {
  ConfirmDialog,
  DataTable,
  EM_DASH,
  ResourceHeader,
  RowActions,
  SearchInput,
  StatusBadge,
  formatDate,
  formatDateTime,
  formatMoney,
  useDebouncedValue,
  type Column,
  type StatusMap,
} from "@/features/_shared";
import { useHasPermission } from "@/features/tenant/auth";
import { cashPaymentMethodLabel } from "@/features/tenant/cash-register/lib/cash-register.constants";
import { ROUTES } from "@/lib/routes";
import {
  CLASS_ENROLL_PERMISSION,
  CLASS_MANAGE_ATTENDANCE_PERMISSION,
  ENROLLMENT_STATUSES,
  ENROLLMENT_STATUS_LABELS,
} from "../lib/class-enrollments.constants";
import {
  useCancelEnrollment,
  useClassEnrollments,
  useClassSessionDetail,
  useMarkAttendance,
} from "../lib/class-enrollments.hooks";
import type { ClassEnrollmentRow, EnrollmentStatus } from "../lib/class-enrollments.types";
import { EnrollDialog } from "./enroll-dialog";

const ENROLLMENT_STATUS_MAP: StatusMap = {
  enrolled: { label: ENROLLMENT_STATUS_LABELS.enrolled, tone: "info" },
  waitlisted: { label: ENROLLMENT_STATUS_LABELS.waitlisted, tone: "warning" },
  cancelled: { label: ENROLLMENT_STATUS_LABELS.cancelled, tone: "danger" },
  attended: { label: ENROLLMENT_STATUS_LABELS.attended, tone: "success" },
  no_show: { label: ENROLLMENT_STATUS_LABELS.no_show, tone: "neutral" },
};

const SESSION_STATUS_LABELS: Record<string, string> = {
  scheduled: "Programada",
  cancelled: "Cancelada",
  completed: "Completada",
};

const STATUS_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Todos los estados" },
  ...ENROLLMENT_STATUSES.map((status) => ({ value: status, label: ENROLLMENT_STATUS_LABELS[status] })),
];

/** `HH:MM:SS` -> `HH:MM`. */
function formatTime(value: string): string {
  return value.slice(0, 5);
}

/** Nombre y dato de contacto de quien ocupa el cupo (socio o visitante). */
function attendeeOf(row: ClassEnrollmentRow) {
  if (row.attendee_type === "lead" && row.lead) {
    return { name: row.lead.name, detail: row.lead.phone ?? row.lead.dni, isVisitor: true };
  }
  return {
    name: row.member?.full_name ?? EM_DASH,
    detail: row.member?.dni ?? row.member?.phone ?? null,
    isVisitor: false,
  };
}

/**
 * Pantalla de inscritos de una sesión (`/classes/sessions/[id]`): lista de
 * inscritos y espera, marcar asistencia y cancelar (con promoción automática
 * desde la espera). Inscribir es un único diálogo sobre la página.
 */
export function ClassEnrollmentsPage({ sessionId }: { sessionId: string }) {
  const hasPermission = useHasPermission();
  const canEnroll = hasPermission(CLASS_ENROLL_PERMISSION);
  const canMarkAttendance = hasPermission(CLASS_MANAGE_ATTENDANCE_PERMISSION);

  const detail = useClassSessionDetail(sessionId);
  const session = detail.session;
  const numericId = session?.id ?? null;

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const [status, setStatus] = useState<EnrollmentStatus | "">("");
  const [page, setPage] = useState(1);
  const [enrolling, setEnrolling] = useState(false);
  const [cancelling, setCancelling] = useState<ClassEnrollmentRow | null>(null);
  const [promoted, setPromoted] = useState<ClassEnrollmentRow[]>([]);

  const enrollments = useClassEnrollments(numericId, {
    page,
    search: debouncedSearch,
    status: status || undefined,
  });
  const markAttendance = useMarkAttendance(numericId ?? 0);
  const cancelEnrollment = useCancelEnrollment(numericId ?? 0);
  const meta = enrollments.data;

  const isScheduled = session?.status === "scheduled";

  function handleAttendance(row: ClassEnrollmentRow, next: "attended" | "no_show") {
    markAttendance.mutate(
      { id: row.id, status: next },
      {
        onSuccess: () =>
          toast.success(next === "attended" ? "Asistencia registrada." : "Falta registrada."),
        onError: (err) =>
          toast.error(err instanceof ApiError ? err.message : "No se pudo registrar la asistencia."),
      },
    );
  }

  function handleCancel() {
    if (!cancelling) return;
    cancelEnrollment.mutate(cancelling.id, {
      onSuccess: (result) => {
        setPromoted(result.promoted);
        toast.success("Inscripción cancelada.");
        setCancelling(null);
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "No se pudo cancelar la inscripción.");
        setCancelling(null);
      },
    });
  }

  const columns: Column<ClassEnrollmentRow>[] = [
    {
      key: "attendee",
      header: "Asistente",
      cell: (row) => {
        const attendee = attendeeOf(row);
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {attendee.name}
              {attendee.isVisitor ? (
                <span className="ml-2 text-xs font-normal text-muted-foreground">Visitante</span>
              ) : null}
            </span>
            {attendee.detail ? (
              <span className="text-xs text-muted-foreground">{attendee.detail}</span>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "access",
      header: "Acceso",
      cell: (row) =>
        row.access_type === "drop_in" ? (
          <div className="flex flex-col">
            <span>Clase suelta</span>
            <span className="text-xs text-muted-foreground">
              {formatMoney(row.amount_paid)}
              {row.payment_method ? ` · ${cashPaymentMethodLabel(row.payment_method)}` : ""}
              {row.refunded_at ? " · devuelta" : ""}
            </span>
          </div>
        ) : (
          <div className="flex flex-col">
            <span>Membresía</span>
            {row.membership_plan ? (
              <span className="text-xs text-muted-foreground">{row.membership_plan}</span>
            ) : null}
          </div>
        ),
    },
    {
      key: "status",
      header: "Estado",
      cell: (row) => <StatusBadge value={row.status} map={ENROLLMENT_STATUS_MAP} />,
    },
    {
      key: "created_at",
      header: "Registrada",
      cell: (row) => (
        <span className="text-muted-foreground tabular-nums">
          {formatDateTime(row.waitlisted_at && row.status === "waitlisted" ? row.waitlisted_at : row.created_at)}
        </span>
      ),
    },
  ];

  const className = session?.class_schedule?.gym_class?.name;
  const waitlistCount = session?.waitlist_count ?? 0;
  const summary = session
    ? [
        formatDate(session.session_date),
        `${formatTime(session.start_time)} – ${formatTime(session.end_time)}`,
        session.instructor?.staff?.full_name,
        `${session.enrolled_count ?? 0}/${session.max_capacity} inscritos${
          waitlistCount ? ` · ${waitlistCount} en espera` : ""
        }`,
        SESSION_STATUS_LABELS[session.status] ?? session.status,
      ]
        .filter(Boolean)
        .join(" · ")
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`${ROUTES.tenant.classes}?tab=sessions`}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Volver a sesiones
      </Link>

      {detail.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la sesión.{" "}
          <button type="button" className="underline underline-offset-2" onClick={() => detail.refetch()}>
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <ResourceHeader
            title={`Inscritos${className ? ` · ${className}` : ""}`}
            description={summary}
            action={
              canEnroll ? (
                <Button
                  onClick={() => setEnrolling(true)}
                  disabled={!isScheduled}
                  title={isScheduled ? undefined : "La sesión no admite nuevas inscripciones."}
                >
                  <UserPlus className="size-4" />
                  Inscribir
                </Button>
              ) : null
            }
          />

          <div className="flex flex-wrap items-center gap-3">
            <SearchInput
              value={search}
              onChangeAction={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Buscar por nombre, DNI o teléfono…"
            />
            <Combobox
              className="w-44"
              value={status}
              onValueChange={(value) => {
                setStatus(value as EnrollmentStatus | "");
                setPage(1);
              }}
              options={STATUS_OPTIONS}
            />
          </div>

          {promoted.length > 0 ? (
            <div className="flex items-start justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
              <div className="flex flex-col gap-1">
                <p className="font-medium">
                  Pasaron de la lista de espera a inscritos. Avísales, no se envía notificación:
                </p>
                <ul className="list-disc pl-5">
                  {promoted.map((row) => {
                    const attendee = attendeeOf(row);
                    return (
                      <li key={row.id}>
                        {attendee.name}
                        {attendee.detail ? ` (${attendee.detail})` : ""}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <button
                type="button"
                aria-label="Cerrar aviso"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setPromoted([])}
              >
                <X className="size-4" />
              </button>
            </div>
          ) : null}

          {enrollments.isError ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              No se pudo cargar los inscritos.{" "}
              <button
                type="button"
                className="underline underline-offset-2"
                onClick={() => enrollments.refetch()}
              >
                Reintentar
              </button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={meta?.data ?? []}
              isLoading={detail.isPending || enrollments.isPending}
              emptyMessage={
                search || status ? "Nadie coincide con el filtro." : "Aún no hay inscritos en esta sesión."
              }
              pagination={{
                page: meta?.current_page ?? page,
                lastPage: meta?.last_page ?? 1,
                total: meta?.total ?? 0,
                from: meta?.from ?? null,
                to: meta?.to ?? null,
                onPageChangeAction: setPage,
                isFetching: enrollments.isFetching,
              }}
              rowActions={(row) => {
                const canMark = canMarkAttendance && row.status === "enrolled";
                const canCancel = canEnroll && (row.status === "enrolled" || row.status === "waitlisted");
                if (!canMark && !canCancel) return null;
                return (
                  <RowActions
                    label="Acciones de la inscripción"
                    actions={[
                      canMark && {
                        label: "Marcar asistencia",
                        icon: Check,
                        disabled: markAttendance.isPending,
                        onSelect: () => handleAttendance(row, "attended"),
                      },
                      canMark && {
                        label: "Marcar falta",
                        icon: UserX,
                        disabled: markAttendance.isPending,
                        onSelect: () => handleAttendance(row, "no_show"),
                      },
                      canCancel && {
                        label: "Cancelar inscripción",
                        icon: X,
                        variant: "destructive",
                        onSelect: () => setCancelling(row),
                      },
                    ]}
                  />
                );
              }}
            />
          )}
        </>
      )}

      {session ? (
        <EnrollDialog open={enrolling} session={session} onOpenChangeAction={setEnrolling} />
      ) : null}

      <ConfirmDialog
        open={cancelling !== null}
        onOpenChange={(open) => {
          if (!open) setCancelling(null);
        }}
        title="Cancelar inscripción"
        description={
          cancelling
            ? cancelling.access_type === "drop_in"
              ? `Se cancelará la inscripción de ${attendeeOf(cancelling).name} y se devolverán ${formatMoney(cancelling.amount_paid)} de caja con el método original.`
              : `Se cancelará la inscripción de ${attendeeOf(cancelling).name}. Si se libera un cupo, pasa el primero de la lista de espera.`
            : undefined
        }
        confirmLabel="Cancelar inscripción"
        cancelLabel="Volver"
        destructive
        loading={cancelEnrollment.isPending}
        onConfirm={handleCancel}
      />
    </div>
  );
}
