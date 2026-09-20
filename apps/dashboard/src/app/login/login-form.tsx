"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { authKeys } from "@/features/tenant/auth";

const FormSchema = z.object({
  email: z.string().email("Correo inválido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

type FormValues = z.infer<typeof FormSchema>;

/** A dónde va el usuario tras autenticarse. Lo decide el panel (ver page.tsx). */
export function LoginForm({
  afterLoginPath = "/tenants",
}: {
  afterLoginPath?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(FormSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    let res: Response;
    try {
      res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    } catch {
      setFormError("No se pudo conectar. Revisa tu conexión.");
      return;
    }

    if (res.ok) {
      // Fuerza a `useCurrentUser` a pedir `/auth/me` de nuevo: sin esto, el
      // caché de react-query (staleTime 5 min) podría servir permisos/plan de
      // una sesión anterior en la misma pestaña (p. ej. tras cerrar sesión e
      // ingresar con otra cuenta) en vez de los recién emitidos por el login.
      await queryClient.invalidateQueries({ queryKey: authKeys.me() });
      router.replace(afterLoginPath);
      router.refresh();
      return;
    }

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
    <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3" noValidate>
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
        <Input
          {...register("password")}
          type="password"
          placeholder="Contraseña"
          autoComplete="current-password"
          aria-invalid={errors.password ? true : undefined}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <Button type="submit" className="mt-2" disabled={isSubmitting}>
        {isSubmitting ? "Ingresando…" : "Ingresar"}
      </Button>
    </form>
  );
}
