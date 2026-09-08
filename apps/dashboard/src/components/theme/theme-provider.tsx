"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

/** Clave en localStorage. Debe coincidir con la del script anti-parpadeo. */
export const THEME_STORAGE_KEY = "flowerpot-theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/* -------------------------------------------------------------------------- */
/*  Store externo: la preferencia vive en localStorage y el tema del SO en    */
/*  matchMedia. `useSyncExternalStore` los lee sin provocar desajustes de     */
/*  hidratación ni renders en cascada.                                        */
/* -------------------------------------------------------------------------- */

const listeners = new Set<() => void>();
let wired = false;

function notify(): void {
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  if (!wired && typeof window !== "undefined") {
    wired = true;
    window.matchMedia(DARK_QUERY).addEventListener("change", notify);
    window.addEventListener("storage", (e) => {
      if (e.key === THEME_STORAGE_KEY) notify();
    });
  }
  return () => {
    listeners.delete(onChange);
  };
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    /* localStorage no disponible */
  }
  return "system";
}

function systemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

function resolvedSnapshot(): ResolvedTheme {
  const theme = readStoredTheme();
  return theme === "system" ? systemTheme() : theme;
}

function applyTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

/* -------------------------------------------------------------------------- */

type ThemeContextValue = {
  /** Preferencia elegida por el usuario. */
  theme: Theme;
  /** Tema realmente aplicado (resuelve `system` según el SO). */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribe,
    readStoredTheme,
    () => "system" as Theme,
  );
  const resolvedTheme = useSyncExternalStore(
    subscribe,
    resolvedSnapshot,
    () => "light" as ResolvedTheme,
  );

  // Mantiene la clase `.dark` en <html> alineada con la preferencia. Cubre los
  // cambios del tema del SO y el remount de Strict Mode en desarrollo, que
  // limpia los atributos que el script inline puso en <html>.
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((next: Theme) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* localStorage no disponible */
    }
    notify();
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  return ctx;
}

/**
 * Script síncrono para el `<head>`: aplica la clase `.dark` antes del primer
 * paint y evita el parpadeo (FOUC) al cargar en modo oscuro.
 */
export const themeInitScript = `(function(){try{var k=${JSON.stringify(
  THEME_STORAGE_KEY,
)};var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark"&&t!=="system")t="system";var d=t==="dark"||(t==="system"&&window.matchMedia("${DARK_QUERY}").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
