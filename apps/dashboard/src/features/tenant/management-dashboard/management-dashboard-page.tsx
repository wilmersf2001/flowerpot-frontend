"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { ResourceHeader } from "@/features/_shared";
import { useHasPermission } from "@/features/tenant/auth";
import { ExportPdfReportsMenu } from "./components/export-pdf-reports-menu";
import { ExportReportsMenu } from "./components/export-reports-menu";
import { CrmPanelView } from "./components/crm-panel";
import { FinancialPanelView } from "./components/financial-panel";
import { MembershipsPanelView } from "./components/memberships-panel";
import { OperationsPanelView } from "./components/operations-panel";
import { AlertBanner } from "./components/primitives";
import { MANAGEMENT_PERMISSION, MONTH_NAMES } from "./lib/management.constants";

const SELECT_CLASS =
  "h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

/** Dashboard de gerencia: 4 paneles (financiero, membresías, operación, CRM) por mes. */
export function ManagementDashboardPage() {
  const hasPermission = useHasPermission();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  if (!hasPermission(MANAGEMENT_PERMISSION)) {
    return (
      <AlertBanner level="warning" message="No tienes permiso para ver el dashboard de gerencia." />
    );
  }

  const params = { month, year };
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Dashboard de gerencia"
        description="Análisis, alertas y recomendaciones del negocio. Los datos se cachean 5 minutos."
        action={
          <div className="flex flex-wrap gap-2">
            <select
              aria-label="Mes"
              className={SELECT_CLASS}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
            <select
              aria-label="Año"
              className={SELECT_CLASS}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ExportReportsMenu params={params} />
            <ExportPdfReportsMenu params={params} />
          </div>
        }
      />

      <Tabs defaultValue="financial" className="flex flex-col gap-6">
        <TabsList className="w-fit">
          <TabsTrigger value="financial">Financiero</TabsTrigger>
          <TabsTrigger value="memberships">Membresías</TabsTrigger>
          <TabsTrigger value="operations">Operación</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
        </TabsList>
        <TabsContent value="financial">
          <FinancialPanelView params={params} />
        </TabsContent>
        <TabsContent value="memberships">
          <MembershipsPanelView params={params} />
        </TabsContent>
        <TabsContent value="operations">
          <OperationsPanelView params={params} />
        </TabsContent>
        <TabsContent value="crm">
          <CrmPanelView params={params} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
