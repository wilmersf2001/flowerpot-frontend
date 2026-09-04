import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Ingresar" };

export default function LoginPage() {
  return (
    <main className="grid min-h-svh place-items-center px-6">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow">
        <h1 className="text-lg font-semibold tracking-tight">
          Ingresar a Flowerpot
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Panel de administración central.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
