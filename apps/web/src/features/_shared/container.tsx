import { cn } from "@repo/ui/lib/utils";

/** Ancho máximo y padding horizontal consistentes en toda la landing. */
export function Container({
  as: Tag = "div",
  className,
  children,
}: {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag className={cn("mx-auto w-full max-w-6xl px-6 sm:px-8", className)}>
      {children}
    </Tag>
  );
}
