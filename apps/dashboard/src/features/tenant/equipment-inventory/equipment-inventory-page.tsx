"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { EquipmentPage } from "@/features/tenant/equipment";
import { EquipmentCategoriesPage } from "@/features/tenant/equipment-categories";
import { EquipmentMaintenancesPage } from "@/features/tenant/equipment-maintenances";

/**
 * Pantalla de "Equipos": Equipos (activo fijo), Categorías y Mantenimientos
 * en pestañas. El estado de cada equipo lo mueve el flujo de mantenimientos.
 */
export function EquipmentInventoryPage() {
  return (
    <Tabs defaultValue="equipment" className="flex flex-col gap-6">
      <TabsList className="w-fit">
        <TabsTrigger value="equipment">Equipos</TabsTrigger>
        <TabsTrigger value="categories">Categorías</TabsTrigger>
        <TabsTrigger value="maintenances">Mantenimientos</TabsTrigger>
      </TabsList>
      <TabsContent value="equipment">
        <EquipmentPage />
      </TabsContent>
      <TabsContent value="categories">
        <EquipmentCategoriesPage />
      </TabsContent>
      <TabsContent value="maintenances">
        <EquipmentMaintenancesPage />
      </TabsContent>
    </Tabs>
  );
}
