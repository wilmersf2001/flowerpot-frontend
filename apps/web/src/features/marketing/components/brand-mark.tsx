import { cn } from "@repo/ui/lib/utils";
import { BRAND } from "../lib/marketing.content";

/**
 * Logotipo de Flowerpot: marca en pastilla lima + wordmark condensado.
 * Ícono propio (barra + discos) — nada de brotes/plantas: la marca es
 * "maceta = mamado", no jardinería.
 */
export function BrandMark({
  className,
  wordmark = true,
}: {
  className?: string;
  wordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="grid size-7.5 place-items-center rounded-lg bg-primary text-primary-foreground">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          className="size-4.25"
          aria-hidden
        >
          <path d="M4 8v8M20 8v8M8 6v12M16 6v12M4 12h16" />
        </svg>
      </span>
      {wordmark ? (
        <span className="display-label text-[19px] leading-none">
          {BRAND.name}
        </span>
      ) : null}
    </span>
  );
}
