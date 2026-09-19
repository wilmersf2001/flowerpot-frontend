export { ProductsPage } from "./products-page";

export {
  useProducts,
  useProductOptions,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useRestoreProduct,
  useToggleProductActive,
} from "./lib/products.hooks";
export { productsApi } from "./lib/products.api";
export { productKeys } from "./lib/products.keys";
export type {
  ProductRow,
  ProductCategoryRef,
  ProductStock,
  ProductListParams,
  CreateProductInput,
  UpdateProductInput,
} from "./lib/products.types";
