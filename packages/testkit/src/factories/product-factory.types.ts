export type ProductCategory = 'seeds' | 'lights' | 'nutrients' | 'equipment' | 'kits';

export interface TestProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  /** Price in Chilean Pesos (whole number, no cents) */
  price: number;
  /** Original price before discount; undefined if no discount */
  compareAtPrice: number | undefined;
  costPrice: number | undefined;
  /** Always CLP for this GrowShop */
  currency: 'CLP';
  category: ProductCategory;
  inStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  images: string[];
  tags: string[];
  weight: number;
  dimensions: { length: number; width: number; height: number };
  supplierId: string | null;
  supplierSku: string | null;
  dropshipEnabled: boolean;
  seo: { title: string; description: string; keywords: string[] };
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductOptions {
  name?: string;
  sku?: string;
  category?: ProductCategory;
  /** Price in CLP */
  price?: number;
  inStock?: boolean;
  supplierId?: string;
  compareAtPrice?: number;
}
