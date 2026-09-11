"use client";

import { Building2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { useSelectedBranch } from "./branch-context";

/**
 * Selector de sede activa en el header. Gobierna `useSelectedBranch()` para
 * el resto de módulos (personal, miembros, etc.), que filtran/preseleccionan
 * en base a esta sede en vez de pedirla en cada formulario.
 */
export function BranchSwitcher() {
  const { branches, selectedBranchId, setSelectedBranchId, isLoading } = useSelectedBranch();

  if (isLoading || branches.length === 0) return null;

  return (
    <Select value={selectedBranchId ?? undefined} onValueChange={setSelectedBranchId}>
      <SelectTrigger
        className="h-8 w-auto min-w-36 gap-2 border-none bg-transparent px-2 shadow-none"
        aria-label="Sede activa"
      >
        <Building2 className="size-4 shrink-0 text-muted-foreground" />
        <SelectValue placeholder="Selecciona una sede" />
      </SelectTrigger>
      <SelectContent align="start">
        {branches.map((branch) => (
          <SelectItem key={branch.id} value={branch.id}>
            {branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
