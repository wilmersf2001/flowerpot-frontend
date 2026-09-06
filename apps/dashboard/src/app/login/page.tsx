import type { Metadata } from "next";
import { currentPanel } from "@/lib/panel";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Ingresar" };

/**
 * Misma ruta `/login` para los dos paneles. El diseño y el destino tras entrar
 * cambian según el panel que resolvió `proxy.ts` desde el subdominio.
 */
export default async function LoginPage() {
  const panel = await currentPanel();
  const isTenant = panel.kind === "tenant";

  return (
    <main
      data-panel={panel.kind}
      className="grid min-h-svh place-items-center px-6"
    >
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow">
        <span
          className={
            isTenant
              ? "inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
              : "inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700"
          }
        >
          {isTenant ? `Gimnasio · ${panel.slug}` : "Administración central"}
        </span>

        <h1 className="mt-3 text-lg font-semibold tracking-tight">
          {isTenant ? "Ingresar a tu gimnasio" : "Ingresar a Flowerpot"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isTenant
            ? "Panel para administrar tu gimnasio."
            : "Panel de administración del SaaS."}
        </p>

        <LoginForm afterLoginPath={isTenant ? "/members" : "/tenants"} />
      </div>
    </main>
  );
}
