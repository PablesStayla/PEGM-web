import type { Money } from '../value-objects/money.vo';
import type { SKU } from '../value-objects/sku.vo';
import type { ProductId } from './product-id.vo';

export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'OUT_OF_STOCK';

export const ProductStatusHelper = {
  isSellable: (status: ProductStatus): boolean => status === 'ACTIVE',
  isVisible: (status: ProductStatus): boolean => status === 'ACTIVE' || status === 'OUT_OF_STOCK',
  canEdit: (status: ProductStatus): boolean => status === 'DRAFT' || status === 'ARCHIVED',
} as const;

export interface CreateProductProps {
  id: ProductId;
  sku: SKU;
  name: string;
  description: string;
  price: Money;
  stockQuantity: number;
  categoryIds?: string[];
  images?: string[];
  supplierId?: string;
}
