"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cifra que sube desde 0 al entrar en pantalla (ease-out). El HTML del servidor
 * trae el valor final, así que sin JS o con reduced-motion se ve igual.
 */
export function StatCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(value);

  useEffect(() => {
    const el = ref.current;
    const target = parseFloat(value);
    if (
      !el ||
      Number.isNaN(target) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const decimals = value.split(".")[1]?.length ?? 0;
    let raf = 0;

    const io = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const duration = 1400;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setText((target * eased).toFixed(decimals));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      {text}
    </span>
  );
}
