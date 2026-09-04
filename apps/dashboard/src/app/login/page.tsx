import type { Metadata } from "next";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";

export const metadata: Metadata = { title: "Ingresar" };

export default function LoginPage() {
  return (
    <main className="grid min-h-svh place-items-center px-6">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow">
        <h1 className="text-lg font-semibold tracking-tight">
          Ingresar a Flowerpot
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          M0: formulario sin lógica. La sesión irá en cookie httpOnly vía el BFF.
        </p>
        {/* TODO(M1): react-hook-form + zod, POST al route handler /api/auth/login */}
        <form className="mt-4 flex flex-col gap-3">
          <Input name="email" type="email" placeholder="Correo" autoComplete="email" />
          <Input
            name="password"
            type="password"
            placeholder="Contraseña"
            autoComplete="current-password"
          />
          <Button type="submit" className="mt-2">
            Ingresar
          </Button>
        </form>
      </div>
    </main>
  );
}
