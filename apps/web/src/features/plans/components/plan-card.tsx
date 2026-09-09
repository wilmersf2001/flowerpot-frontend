import { Check } from "lucide-react";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";
import type { PublicPlan } from "../lib/plans.types";
import {
  billingSuffix,
  locationsLimitLabel,
  membersLimitLabel,
} from "../lib/plans.format";

/**
 * Tarjeta de un plan. Presentacional pura: recibe el `PublicPlan` ya
 * normalizado y una marca `featured` para el plan destacado.
 */
export function PlanCard({
  plan,
  featured = false,
}: {
  plan: PublicPlan;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-md border bg-card p-8 transition-transform duration-300 hover:-translate-y-1",
        featured ? "border-primary" : "border-border",
      )}
    >
      {featured ? (
        <span className="display-label absolute -top-3 left-8 rounded-[4px] bg-primary px-3 py-1 text-[11px] text-primary-foreground">
          El más elegido
        </span>
      ) : null}

      <h3 className="display-label text-[15px] text-foreground">{plan.name}</h3>
      <p className="mt-2 min-h-10 text-sm text-muted-foreground">
        {plan.description}
      </p>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="display-heading text-4xl">
          {plan.priceFormatted || "A medida"}
        </span>
        <span className="text-sm text-muted-foreground">
          {billingSuffix(plan)}
        </span>
      </div>

      <Button
        size="lg"
        variant={featured ? "default" : "outline"}
        className="mt-6 w-full"
      >
        Empezar prueba
      </Button>

      <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1 border-y border-border/60 py-3 text-xs text-muted-foreground">
        <span>{locationsLimitLabel(plan)}</span>
        <span aria-hidden>·</span>
        <span>{membersLimitLabel(plan)}</span>
      </div>

      <ul className="mt-6 flex flex-col gap-3 text-sm">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="text-pretty">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
