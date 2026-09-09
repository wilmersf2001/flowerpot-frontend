import { cn } from "@repo/ui/lib/utils";
import { Container } from "./container";

/**
 * Bloque vertical estándar de la landing: espaciado, ancho y un encabezado
 * opcional (eyebrow + título + bajada). Las secciones concretas solo aportan
 * su contenido.
 */
export function Section({
  id,
  eyebrow,
  title,
  description,
  align = "center",
  className,
  containerClassName,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "start";
  className?: string;
  containerClassName?: string;
  children?: React.ReactNode;
}) {
  const hasHeader = eyebrow || title || description;
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 py-20 sm:py-28", className)}
    >
      <Container className={containerClassName}>
        {hasHeader ? (
          <div
            className={cn(
              "flex flex-col gap-4",
              align === "center"
                ? "mx-auto max-w-2xl text-center"
                : "max-w-2xl",
            )}
          >
            {eyebrow ? (
              <span className="display-label text-[12px] text-primary">
                {eyebrow}
              </span>
            ) : null}
            {title ? (
              <h2 className="display-heading text-[clamp(1.75rem,4.5vw,3rem)]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                {description}
              </p>
            ) : null}
          </div>
        ) : null}
        {children ? (
          <div className={cn(hasHeader && "mt-14")}>{children}</div>
        ) : null}
      </Container>
    </section>
  );
}
