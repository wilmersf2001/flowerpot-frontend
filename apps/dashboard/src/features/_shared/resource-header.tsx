/** Encabezado estándar de una pantalla de recurso: título + descripción + acción. */
export function ResourceHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  /** Normalmente el botón "Nuevo …". */
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="display-heading text-2xl text-foreground sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
