import type { Metadata } from "next";
import { Badge } from "@repo/ui/badge";
import { currentPanel } from "@/lib/panel";
import { LoginBackdrop } from "./login-backdrop";
import { LoginCard } from "./login-card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Ingresar" };

const idx = (i: number) => ({ "--i": i }) as React.CSSProperties;

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
      className="bg-brand-glow relative isolate min-h-svh overflow-hidden"
    >
      <LoginBackdrop />

      <div className="relative mx-auto grid min-h-svh w-full max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Columna de marca (solo desktop) */}
        <div className="hidden lg:block">
          <div className="login-item flex items-center gap-3" style={idx(0)}>
            <span className="h-px w-8 bg-primary" />
            <span className="display-label text-[12px] text-primary">
              Flowerpot
            </span>
          </div>
          <h2
            className="login-item display-heading mt-6 text-[clamp(3rem,6vw,5.5rem)]"
            style={idx(1)}
          >
            {isTenant ? "Tu gimnasio," : "Todo el SaaS,"}
            <br />
            <span className="text-primary">a máxima</span>
            <br />
            potencia.
          </h2>
          <svg
            viewBox="0 0 300 12"
            className="login-item mt-6 h-3 w-72 text-primary"
            style={idx(2)}
            aria-hidden
          >
            <path
              d="M0 6 L40 6 L52 1 L66 11 L80 3 L96 8 L300 6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              opacity={0.25}
            />
            <path
              className="login-bolt"
              d="M0 6 L40 6 L52 1 L66 11 L80 3 L96 8 L300 6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            />
          </svg>
          <p
            className="login-item mt-6 max-w-sm text-pretty text-muted-foreground"
            style={idx(3)}
          >
            Socios, clases, pagos y aforo en un solo panel. Mueve el cursor y
            haz clic: la red responde.
          </p>
        </div>

        <LoginCard>
          <span
            className="login-item display-heading block text-sm text-primary lg:hidden"
            style={idx(0)}
          >
            Flowerpot
          </span>

          <Badge
            tone={isTenant ? "success" : "neutral"}
            className="login-item mt-3 lg:mt-0"
            style={idx(0)}
          >
            {isTenant ? `Gimnasio · ${panel.slug}` : "Administración central"}
          </Badge>

          <h1
            className="login-item display-heading mt-4 text-3xl"
            style={idx(1)}
          >
            {isTenant ? "Ingresar a tu gimnasio" : "Ingresar a Flowerpot"}
          </h1>
          <p
            className="login-item mt-2 text-sm text-muted-foreground"
            style={idx(2)}
          >
            {isTenant
              ? "Panel para administrar tu gimnasio."
              : "Panel de administración del SaaS."}
          </p>

          <LoginForm afterLoginPath={isTenant ? "/members" : "/tenants"} />
        </LoginCard>
      </div>
    </main>
  );
}
