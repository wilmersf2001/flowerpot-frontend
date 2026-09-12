"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { ExpenseCategoriesPage } from "@/features/tenant/expense-categories";
import { ExpensesPage } from "./expenses-page";

/** Pantalla de gastos, con una segunda pestaña para administrar las categorías. */
export function ExpensesRootPage() {
  return (
    <Tabs defaultValue="expenses" className="flex flex-col gap-6">
      <TabsList className="w-fit">
        <TabsTrigger value="expenses">Gastos</TabsTrigger>
        <TabsTrigger value="categories">Categorías</TabsTrigger>
      </TabsList>
      <TabsContent value="expenses">
        <ExpensesPage />
      </TabsContent>
      <TabsContent value="categories">
        <ExpenseCategoriesPage />
      </TabsContent>
    </Tabs>
  );
}
