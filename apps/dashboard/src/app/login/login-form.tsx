"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Eye, EyeOff, Zap } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { authKeys } from "@/features/tenant/auth";

const FormSchema = z.object({
  email: z.string().email("Correo inválido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

type FormValues = z.infer<typeof FormSchema>;

/** Avisa al fondo/tarjeta del estado del login (rayos mientras carga). */
function emit(state: "loading" | "success" | "idle") {
  window.dispatchEvent(new CustomEvent("login:state", { detail: state }));
}

/** A dónde va el usuario tras autenticarse. Lo decide el panel (ver page.tsx). */
export function LoginForm({
  afterLoginPath = "/tenants",
}: {
  afterLoginPath?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  // Se mantiene tras un login correcto hasta que termina la navegación.
  const [redirecting, setRedirecting] = useState(false);
  const sweepRef = useRef<HTMLSpanElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(FormSchema) });

  const busy = isSubmitting || redirecting;

  // Barridos de luz sobre el botón: uno, luego otro, cada vez más rápido
  // (como si fuera a reventar) hasta que termina la carga.
  useEffect(() => {
    const el = sweepRef.current;
    if (!busy || !el || typeof el.animate !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let stopped = false;
    let duration = 950;
    const run = () => {
      if (stopped) return;
      const progress = 1 - (duration - 90) / 860; // 0 → 1 al acelerar
      el.style.opacity = String(0.55 + progress * 0.45);
      const anim = el.animate(
        [
          { transform: "translateX(-130%) skewX(-18deg)" },
          { transform: "translateX(130%) skewX(-18deg)" },
        ],
        { duration, easing: "ease-in" },
      );
      anim.onfinish = () => {
        duration = Math.max(90, duration * 0.74);
        run();
      };
    };
    run();

    return () => {
      stopped = true;
      el.getAnimations().forEach((a) => a.cancel());
    };
  }, [busy]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    emit("loading");

    let res: Response;
    try {
      res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    } catch {
      emit("idle");
      setFormError("No se pudo conectar. Revisa tu conexión.");
      return;
    }

    if (res.ok) {
      setRedirecting(true);
      emit("success");
      // Fuerza a `useCurrentUser` a pedir `/auth/me` de nuevo: sin esto, el
      // caché de react-query (staleTime 5 min) podría servir permisos/plan de
      // una sesión anterior en la misma pestaña (p. ej. tras cerrar sesión e
      // ingresar con otra cuenta) en vez de los recién emitidos por el login.
      await queryClient.invalidateQueries({ queryKey: authKeys.me() });
      router.replace(afterLoginPath);
      router.refresh();
      return;
    }

    emit("idle");
    const body = (await res.json().catch(() => null)) as
      | { message?: string; errors?: Record<string, string[]> }
      | null;

    if (body?.errors) {
      for (const [field, messages] of Object.entries(body.errors)) {
        if ((field === "email" || field === "password") && messages?.[0]) {
          setError(field, { message: messages[0] });
        }
      }
    }
    setFormError(body?.message ?? "No se pudo iniciar sesión.");
  });

  return (
    <form onSubmit={onSubmit} className="login-item mt-5 flex flex-col gap-3" style={{ "--i": 4 } as React.CSSProperties} noValidate>
      <div className="flex flex-col gap-1">
        <Input
          {...register("email")}
          type="email"
          placeholder="Correo"
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="relative">
          <Input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            autoComplete="current-password"
            aria-invalid={errors.password ? true : undefined}
            className="pr-9"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <Button
        type="submit"
        className="login-cta mt-2"
        disabled={busy}
        aria-busy={busy}
      >
        <span
          ref={sweepRef}
          aria-hidden
          className="login-sweep"
          style={{ transform: "translateX(-130%) skewX(-18deg)" }}
        />
        {busy ? (
          <>
            <Zap className="login-zap size-4" aria-hidden />
            {redirecting ? "Entrando…" : "Ingresando…"}
          </>
        ) : (
          "Ingresar"
        )}
      </Button>
    </form>
  );
}
