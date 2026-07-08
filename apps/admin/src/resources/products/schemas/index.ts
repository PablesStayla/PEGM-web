/**
 * Product Schemas - Re-exports from actions/types
 */

export type {
  AdminProductFilters,
  CreateProductInput,
  DeleteProductInput,
  ProductWithDetails,
  ToggleProductActiveInput,
  UpdateProductInput,
  UpdateProductStockInput,
} from '../actions/types';
export {
  createProductSchema,
  deleteProductSchema,
  getAdminProductsSchema,
  toggleProductActiveSchema,
  updateProductSchema,
  updateProductStockSchema,
} from '../actions/types';
