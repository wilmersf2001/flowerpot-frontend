"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Tarjeta del login con foco que sigue al cursor y una inclinación 3D muy
 * sutil. Solo CSS vars + transform: sin re-render por movimiento.
 */
export function LoginCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onState = (ev: Event) => {
      const state = (ev as CustomEvent<string>).detail;
      if (state === "loading" || state === "success") {
        ref.current?.setAttribute("data-busy", "");
      } else {
        ref.current?.removeAttribute("data-busy");
      }
    };
    window.addEventListener("login:state", onState);
    return () => window.removeEventListener("login:state", onState);
  }, []);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.setProperty("--rx", `${(0.5 - py) * 5}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 6}deg`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div className="login-stage">
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="login-card relative w-full max-w-sm rounded-xl border bg-card/80 p-7 shadow-2xl backdrop-blur-md"
      >
        <span className="login-corner left-0 top-0 border-l-2 border-t-2" />
        <span className="login-corner right-0 top-0 border-r-2 border-t-2" />
        <span className="login-corner bottom-0 left-0 border-b-2 border-l-2" />
        <span className="login-corner bottom-0 right-0 border-b-2 border-r-2" />
        {children}
      </div>
    </div>
  );
}
