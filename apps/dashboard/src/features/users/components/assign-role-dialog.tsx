"use client";

import { useState } from "react";
import { ApiError } from "@repo/api-client";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import { toast } from "@repo/ui/toast";
import { AppDialog, Field } from "@/features/_shared";
import { useRoles } from "../lib/roles.hooks";
import { useAssignRole } from "../lib/users.hooks";
import type { UserRow } from "../lib/users.types";

/**
 * Diálogo para asignar (o reemplazar) el rol de un usuario. El padre pasa el
 * usuario objetivo (o `null` para cerrar). La lista de roles es chica y
 * acotada por gimnasio, así que se trae completa con un `Combobox` estático.
 *
 * El contenido va en `AssignRoleForm`, montado con `key={user.id}`: así cada
 * usuario arranca con su propio rol preseleccionado sin sincronizar estado
 * "de fuera hacia adentro" en un efecto.
 */
export function AssignRoleDialog({
  user,
  onOpenChangeAction,
}: {
  user: UserRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  return (
    <AppDialog
      open={user !== null}
      onOpenChange={onOpenChangeAction}
      title={`Cambiar rol de "${user?.name ?? ""}"`}
      description="El usuario pasa a tener los permisos del nuevo rol de inmediato."
    >
      {user ? (
        <AssignRoleForm
          key={user.id}
          user={user}
          onDoneAction={() => onOpenChangeAction(false)}
        />
      ) : null}
    </AppDialog>
  );
}

function AssignRoleForm({
  user,
  onDoneAction,
}: {
  user: UserRow;
  onDoneAction: () => void;
}) {
  const roles = useRoles();
  const assignRole = useAssignRole();
  const [selected, setSelected] = useState(user.role);

  const options: ComboboxOption[] = (roles.data?.data ?? []).map((role) => ({
    value: role.name,
    label: role.name,
  }));

  async function onConfirm() {
    if (!selected) return;
    try {
      await assignRole.mutateAsync({ id: user.id, role: selected });
      toast.success(`Rol de "${user.name}" actualizado.`);
      onDoneAction();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo cambiar el rol.";
      toast.error(message);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Rol" htmlFor="assign-role-select">
        <Combobox
          id="assign-role-select"
          value={selected}
          onValueChange={setSelected}
          options={options}
          searchable
          placeholder="Selecciona un rol"
          disabled={roles.isPending}
        />
      </Field>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onDoneAction}
          disabled={assignRole.isPending}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={assignRole.isPending || !selected}
        >
          {assignRole.isPending ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
