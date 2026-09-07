"use client";

import { useEffect, useState } from "react";

/**
 * Devuelve `value` con un retardo. Útil para no disparar una query por cada
 * tecla en un campo de búsqueda.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
