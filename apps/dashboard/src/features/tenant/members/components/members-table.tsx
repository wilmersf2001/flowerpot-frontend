"use client";

import { Mars, Pencil, RotateCcw, Trash2, Venus, VenusAndMars } from "lucide-react";
import { Switch } from "@repo/ui/switch";
import { toast } from "@repo/ui/toast";
import { ApiError } from "@repo/api-client";
import {
  DataTable,
  EM_DASH,
  RowActions,
  StatusBadge,
  ACTIVE_MAP,
  type Column,
  type DataTablePagination,
  type StatusMap,
} from "@/features/_shared";
import { MemberRow } from "../lib/members.types";
import { useRestoreMember, useToggleMemberActive } from "../lib/members.hooks";

const GENDER_STYLE: Record<
  NonNullable<MemberRow["gender"]>,
  { icon: typeof Mars; className: string; label: string }
> = {
  male: {
    icon: Mars,
    className: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    label: "Masculino",
  },
  female: {
    icon: Venus,
    className: "bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400",
    label: "Femenino",
  },
  other: {
    icon: VenusAndMars,
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    label: "Otro",
  },
};

const DELETED_MAP: StatusMap = {
  true: { label: "Eliminado", tone: "danger" },
};

const MEMBERSHIP_STATUS_MAP: StatusMap = {
  active: { label: "Activa", tone: "success" },
  pending: { label: "Pendiente", tone: "info" },
  cancelled: { label: "Cancelada", tone: "danger" },
  expired: { label: "Expirada", tone: "warning" },
};

const baseColumns: Column<MemberRow>[] = [
  {
    key: "gender",
    header: "",
    cell: (row) => {
      const style = row.gender ? GENDER_STYLE[row.gender] : null;
      const Icon = style?.icon ?? VenusAndMars;
      return (
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            style?.className ??
            "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
          }`}
          title={style?.label ?? "Sin especificar"}
        >
          <Icon className="h-4 w-4" />
        </div>
      );
    },
  },
  {
    key: "full_name",
    header: "Socio",
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.full_name}</span>
        <span className="text-xs text-muted-foreground">{row.dni}</span>
      </div>
    ),
  },
  {
    key: "phone",
    header: "Contacto",
    cell: (row) => (
      <div className="flex flex-col text-muted-foreground">
        <span>{row.phone || EM_DASH}</span>
        <span className="text-xs">{row.email || EM_DASH}</span>
      </div>
    ),
  },
  {
    key: "active_membership_status",
    header: "Membresía",
    cell: (row) =>
      row.active_membership_status ? (
        <div className="flex flex-col gap-1">
          <StatusBadge
            value={row.active_membership_status}
            map={MEMBERSHIP_STATUS_MAP}
          />
          {row.active_membership_plan_name ? (
            <span className="text-xs text-muted-foreground">
              {row.active_membership_plan_name}
            </span>
          ) : null}
        </div>
      ) : (
        <span className="text-muted-foreground">{EM_DASH}</span>
      ),
  },
];

export function MembersTable({
  rows,
  isLoading,
  onEditAction,
  onDeleteAction,
  pagination,
  emptyMessage = "Aún no hay socios. Crea el primero.",
}: {
  rows: MemberRow[];
  isLoading: boolean;
  onEditAction: (member: MemberRow) => void;
  onDeleteAction: (member: MemberRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const toggleActive = useToggleMemberActive();
  const restoreMember = useRestoreMember();
  const pendingId = toggleActive.isPending
    ? toggleActive.variables.id
    : undefined;

  function handleToggle(member: MemberRow) {
    toggleActive.mutate(member, {
      onSuccess: (updated) =>
        toast.success(
          updated.is_active
            ? `Socio "${member.full_name}" activado.`
            : `Socio "${member.full_name}" desactivado.`,
        ),
      onError: (err) =>
        toast.error(
          err instanceof ApiError
            ? err.message
            : `No se pudo cambiar el estado de "${member.full_name}".`,
        ),
    });
  }

  function handleRestore(member: MemberRow) {
    restoreMember.mutate(member.id, {
      onSuccess: () => toast.success(`Socio "${member.full_name}" restaurado.`),
      onError: (err) =>
        toast.error(
          err instanceof ApiError
            ? err.message
            : `No se pudo restaurar "${member.full_name}".`,
        ),
    });
  }

  // La columna "Activo" combina el badge de estado con un switch para
  // cambiarlo sin abrir el diálogo de edición. Un socio eliminado no se
  // puede (des)activar: se ve solo el badge "Eliminado".
  const columns: Column<MemberRow>[] = [
    ...baseColumns,
    {
      key: "is_active",
      header: "Activo",
      cell: (row) =>
        row.deleted_at ? (
          <StatusBadge value={true} map={DELETED_MAP} />
        ) : (
          <div className="flex items-center gap-2">
            <Switch
              size="sm"
              checked={row.is_active}
              disabled={pendingId === row.id}
              onCheckedChange={() => handleToggle(row)}
              aria-label={`Activar socio ${row.full_name}`}
            />
            <StatusBadge value={row.is_active} map={ACTIVE_MAP} />
          </div>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      pagination={pagination}
      rowActions={(row) => {
        const isDeleted = Boolean(row.deleted_at);
        return (
          <RowActions
            label={`Acciones de ${row.full_name}`}
            actions={[
              isDeleted
                ? {
                    label: "Restaurar",
                    icon: RotateCcw,
                    disabled:
                      restoreMember.isPending &&
                      restoreMember.variables === row.id,
                    onSelect: () => handleRestore(row),
                  }
                : {
                    label: "Editar",
                    icon: Pencil,
                    onSelect: () => onEditAction(row),
                  },
              !isDeleted && {
                label: "Eliminar",
                icon: Trash2,
                variant: "destructive",
                separatorBefore: true,
                onSelect: () => onDeleteAction(row),
              },
            ]}
          />
        );
      }}
    />
  );
}
