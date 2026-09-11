"use client";

import { Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Switch } from "@repo/ui/switch";
import { toast } from "@repo/ui/toast";
import { ApiError } from "@repo/api-client";
import {
  DataTable,
  EM_DASH,
  RowActions,
  StatusBadge,
  ACTIVE_MAP,
  formatDate,
  type Column,
  type DataTablePagination,
  type StatusMap,
} from "@/features/_shared";
import { StaffRow } from "../lib/staff.types";
import { useRestoreStaff, useToggleStaffActive } from "../lib/staff.hooks";

const DELETED_MAP: StatusMap = {
  true: { label: "Eliminado", tone: "danger" },
};

const baseColumns: Column<StaffRow>[] = [
  {
    key: "full_name",
    header: "Personal",
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.full_name}</span>
        <span className="text-xs text-muted-foreground">{row.dni}</span>
      </div>
    ),
  },
  {
    key: "job_position_name",
    header: "Cargo",
    cell: (row) => (
      <span className="text-muted-foreground">{row.job_position_name || EM_DASH}</span>
    ),
  },
  {
    key: "branches",
    header: "Sedes",
    cell: (row) => (
      <span className="text-muted-foreground">
        {row.branches.length > 0
          ? row.branches.map((branch) => branch.name).join(", ")
          : EM_DASH}
      </span>
    ),
  },
  {
    key: "contact",
    header: "Contacto",
    cell: (row) => (
      <div className="flex flex-col">
        <span>{row.phone || EM_DASH}</span>
        <span className="text-xs text-muted-foreground">{row.email || EM_DASH}</span>
      </div>
    ),
  },
  {
    key: "hire_date",
    header: "Ingreso",
    cell: (row) => (
      <span className="text-muted-foreground">
        {row.hire_date ? formatDate(row.hire_date) : EM_DASH}
      </span>
    ),
  },
];

export function StaffTable({
  rows,
  isLoading,
  onEditAction,
  onDeleteAction,
  pagination,
  emptyMessage = "Aún no hay personal registrado. Crea el primero.",
}: {
  rows: StaffRow[];
  isLoading: boolean;
  onEditAction: (staff: StaffRow) => void;
  onDeleteAction: (staff: StaffRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const toggleActive = useToggleStaffActive();
  const restoreStaff = useRestoreStaff();
  const pendingId = toggleActive.isPending ? toggleActive.variables.id : undefined;

  function handleToggle(staff: StaffRow) {
    toggleActive.mutate(staff, {
      onSuccess: (updated) =>
        toast.success(
          updated.is_active
            ? `"${staff.full_name}" activado.`
            : `"${staff.full_name}" desactivado.`,
        ),
      onError: (err) =>
        toast.error(
          err instanceof ApiError
            ? err.message
            : `No se pudo cambiar el estado de "${staff.full_name}".`,
        ),
    });
  }

  function handleRestore(staff: StaffRow) {
    restoreStaff.mutate(staff.id, {
      onSuccess: () => toast.success(`"${staff.full_name}" restaurado.`),
      onError: (err) =>
        toast.error(
          err instanceof ApiError
            ? err.message
            : `No se pudo restaurar "${staff.full_name}".`,
        ),
    });
  }

  // La columna "Activo" combina el badge de estado con un switch para
  // cambiarlo sin abrir el diálogo de edición. Un miembro eliminado no se
  // puede (des)activar: se ve solo el badge "Eliminado".
  const columns: Column<StaffRow>[] = [
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
              aria-label={`Activar a ${row.full_name}`}
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
                    disabled: restoreStaff.isPending && restoreStaff.variables === row.id,
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
