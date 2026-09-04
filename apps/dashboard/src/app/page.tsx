import Link from "next/link";
import { Button } from "@repo/ui/button";

/**
 * Temporary index. Once `middleware.ts` routes by subdomain (M1), "/" will be
 * rewritten to each panel's landing section and this page won't be reached.
 */
export default function DashboardIndex() {
  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Flowerpot · Dashboard
      </h1>
      <p className="text-sm text-muted-foreground">
        M0: una sola app, dos paneles por subdominio. Atajos de desarrollo:
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/tenants">Panel central (admin)</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/members">Panel gimnasio (tenant)</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </main>
  );
}
