export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  basePrice?: number;
  salePrice?: number;
  costPrice?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'OUT_OF_STOCK';
  isFeatured: boolean;
  categoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductListParams {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search?: string;
  categoryId?: string;
  status?: string;
}
