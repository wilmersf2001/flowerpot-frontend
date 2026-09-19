"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { ProductsPage } from "@/features/tenant/products";
import { ProductCategoriesPage } from "@/features/tenant/product-categories";
import { SuppliersPage } from "@/features/tenant/suppliers";
import { PurchaseOrdersPage } from "@/features/tenant/purchase-orders";
import { StockMovementsPage } from "@/features/tenant/stock-movements";

/**
 * Pantalla de inventario: Productos, Categorías, Proveedores, Órdenes de
 * compra y Movimientos (Kardex) en pestañas.
 */
export function InventoryPage() {
  return (
    <Tabs defaultValue="products">
      <TabsList>
        <TabsTrigger value="products">Productos</TabsTrigger>
        <TabsTrigger value="categories">Categorías</TabsTrigger>
        <TabsTrigger value="suppliers">Proveedores</TabsTrigger>
        <TabsTrigger value="purchase-orders">Órdenes de compra</TabsTrigger>
        <TabsTrigger value="movements">Movimientos</TabsTrigger>
      </TabsList>
      <TabsContent value="products">
        <ProductsPage />
      </TabsContent>
      <TabsContent value="categories">
        <ProductCategoriesPage />
      </TabsContent>
      <TabsContent value="suppliers">
        <SuppliersPage />
      </TabsContent>
      <TabsContent value="purchase-orders">
        <PurchaseOrdersPage />
      </TabsContent>
      <TabsContent value="movements">
        <StockMovementsPage />
      </TabsContent>
    </Tabs>
  );
}
