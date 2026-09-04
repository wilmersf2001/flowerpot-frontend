import { Button } from "@repo/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-4xl flex-col justify-center gap-6 px-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">
        Flowerpot
      </p>
      <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
        El software de gestión para tu gimnasio en Perú
      </h1>
      <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
        Socios, membresías, pagos, control de acceso y caja. Multi-sede y
        multi-tenant. Este es el sitio público (M0: solo andamiaje).
      </p>
      <div className="flex gap-3">
        <Button size="lg">Empezar prueba</Button>
        <Button size="lg" variant="outline">
          Ver planes
        </Button>
      </div>
    </main>
  );
}
