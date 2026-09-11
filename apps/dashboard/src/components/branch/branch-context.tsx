"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useCurrentUser, type CurrentUserBranch } from "@/features/tenant/auth";

/** Clave en localStorage para recordar la sede elegida entre sesiones. */
export const SELECTED_BRANCH_STORAGE_KEY = "flowerpot-selected-branch";

function readStoredBranchId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SELECTED_BRANCH_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredBranchId(id: string): void {
  try {
    window.localStorage.setItem(SELECTED_BRANCH_STORAGE_KEY, id);
  } catch {
    /* localStorage no disponible */
  }
}

type BranchContextValue = {
  /** Sedes asignadas al usuario autenticado. Vacío mientras carga. */
  branches: CurrentUserBranch[];
  /** Sede activa. `null` mientras no hay ninguna sede cargada todavía. */
  selectedBranch: CurrentUserBranch | null;
  selectedBranchId: string | null;
  setSelectedBranchId: (id: string) => void;
  isLoading: boolean;
};

const BranchContext = createContext<BranchContextValue | null>(null);

/**
 * Sede activa del panel tenant, elegida entre las sedes asignadas al usuario
 * (`GET /auth/me`). Gobierna el filtro de sede para el resto de módulos
 * (personal, miembros, etc.), que la consumen vía `useSelectedBranch()` en
 * vez de pedir la sede en cada formulario o listado.
 */
export function BranchProvider({ children }: { children: React.ReactNode }) {
  const { data: currentUser, isLoading } = useCurrentUser();
  const branches = useMemo(() => currentUser?.branches ?? [], [currentUser]);

  // Solo guarda una elección explícita del usuario en esta sesión de la
  // pestaña; el default (localStorage o la primera sede) se deriva al vuelo
  // en el render, sin efectos, para no depender del orden de llegada de
  // `branches` (que llega async desde `/auth/me`).
  const [explicitBranchId, setExplicitBranchId] = useState<string | null>(null);

  const selectedBranchId = useMemo(() => {
    if (explicitBranchId && branches.some((branch) => branch.id === explicitBranchId)) {
      return explicitBranchId;
    }
    const stored = readStoredBranchId();
    if (stored && branches.some((branch) => branch.id === stored)) return stored;
    return branches[0]?.id ?? null;
  }, [branches, explicitBranchId]);

  function setSelectedBranchId(id: string): void {
    setExplicitBranchId(id);
    writeStoredBranchId(id);
  }

  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.id === selectedBranchId) ?? null,
    [branches, selectedBranchId],
  );

  const value = useMemo<BranchContextValue>(
    () => ({ branches, selectedBranch, selectedBranchId, setSelectedBranchId, isLoading }),
    [branches, selectedBranch, selectedBranchId, isLoading],
  );

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
}

export function useSelectedBranch(): BranchContextValue {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error("useSelectedBranch debe usarse dentro de <BranchProvider>");
  return ctx;
}
