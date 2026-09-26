"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { ServicesPage } from "@/features/tenant/services";
import { MembershipPlansPage } from "./membership-plans-page";

/** Pantalla de planes de membresía, con una segunda pestaña para administrar los servicios. */
export function MembershipPlansRootPage() {
  return (
    <Tabs defaultValue="plans" className="flex flex-col gap-6">
      <TabsList className="w-fit">
        <TabsTrigger value="plans">Planes</TabsTrigger>
        <TabsTrigger value="services">Servicios</TabsTrigger>
      </TabsList>
      <TabsContent value="plans">
        <MembershipPlansPage />
      </TabsContent>
      <TabsContent value="services">
        <ServicesPage />
      </TabsContent>
    </Tabs>
  );
}
