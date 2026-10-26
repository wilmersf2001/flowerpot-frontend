"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { GymClassesPage } from "@/features/tenant/gym-classes";
import { ClassSchedulesPage } from "@/features/tenant/class-schedules";
import { ClassSessionsPage } from "@/features/tenant/class-sessions";

/**
 * Pantalla de "Clases y Horarios" (módulo 16): tres pestañas para las tres
 * capas del dominio — catálogo de clases, horarios recurrentes por sede e
 * instructor, y las sesiones concretas que el backend genera cada semana.
 */
export function ClassesPage({ defaultTab }: { defaultTab?: string }) {
  const initialTab = ["gym-classes", "schedules", "sessions"].includes(defaultTab ?? "")
    ? (defaultTab as string)
    : "gym-classes";
  return (
    <Tabs defaultValue={initialTab} className="flex flex-col gap-6">
      <TabsList className="w-fit">
        <TabsTrigger value="gym-classes">Clases</TabsTrigger>
        <TabsTrigger value="schedules">Horarios</TabsTrigger>
        <TabsTrigger value="sessions">Sesiones</TabsTrigger>
      </TabsList>
      <TabsContent value="gym-classes">
        <GymClassesPage />
      </TabsContent>
      <TabsContent value="schedules">
        <ClassSchedulesPage />
      </TabsContent>
      <TabsContent value="sessions">
        <ClassSessionsPage />
      </TabsContent>
    </Tabs>
  );
}
