/**
 * M0 placeholder for a resource screen. Replace with the real list/detail UI
 * as each module is built (M1+).
 */
export function ResourceScaffold({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        Módulo aún no implementado (M0: solo estructura).
      </div>
    </div>
  );
}
