"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { CurrentCashRegisterSection } from "./components/current-cash-register-section";
import { CashRegisterHistorySection } from "./components/cash-register-history-section";

/** Pantalla de caja: pestaña "Caja actual" (operación diaria) e "Historial" (cajas pasadas). */
export function CashRegisterPage() {
  return (
    <Tabs defaultValue="current" className="flex flex-col gap-6">
      <TabsList className="w-fit">
        <TabsTrigger value="current">Caja actual</TabsTrigger>
        <TabsTrigger value="history">Historial</TabsTrigger>
      </TabsList>
      <TabsContent value="current">
        <CurrentCashRegisterSection />
      </TabsContent>
      <TabsContent value="history">
        <CashRegisterHistorySection />
      </TabsContent>
    </Tabs>
  );
}
