"use client";

import { useEffect, useRef } from "react";
import { cn } from "@repo/ui/lib/utils";

/**
 * Revela su contenido con un empuje suave al entrar al viewport. Lo que ya es
 * visible al montar no se oculta (sin parpadeo) y sin JS todo se ve normal.
 * `index` escalona elementos hermanos.
 */
export function Reveal({
  index = 0,
  className,
  children,
}: {
  index?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.95) return;

    el.dataset.reveal = "hidden";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        // Un frame para que el estado oculto se pinte antes de la transición.
        requestAnimationFrame(() => {
          el.dataset.reveal = "shown";
        });
        io.disconnect();
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{ "--i": index } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
