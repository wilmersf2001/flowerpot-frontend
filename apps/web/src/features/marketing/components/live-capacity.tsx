"use client";

import { useEffect, useState } from "react";

const MAX = 120;

/** Aforo "en vivo": respira alrededor de 68 como un gimnasio en hora punta. */
export function LiveCapacity() {
  const [count, setCount] = useState(68);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setCount((c) => {
        const next = c + Math.round((Math.random() - 0.45) * 5);
        return Math.min(84, Math.max(56, next));
      });
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const pct = Math.round((count / MAX) * 100);

  return (
    <div className="absolute inset-x-6 bottom-6">
      <div className="display-label flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="fp-live size-2 rounded-full bg-primary" />
        Aforo en vivo · Sede Miraflores
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="display-heading text-5xl tabular-nums text-primary">
          {count}
        </span>
        <span className="display-label text-sm text-muted-foreground">
          / {MAX}
        </span>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-border">
        <div
          className="h-full bg-primary transition-[width] duration-1000 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
