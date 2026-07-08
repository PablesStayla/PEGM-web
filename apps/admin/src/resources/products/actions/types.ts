/**
 * Product Action Types and Schemas
 */

import { z } from 'zod';

export type ProductWithDetails = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  salePrice: number | null;
  stockQuantity: number | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'OUT_OF_STOCK';
  isFeatured: boolean;
  createdAt: Date;
  category: {
    id: string;
    name: string;
  } | null;
};

export const getAdminProductsSchema = z
  .object({
    search: z.string().optional(),
    category: z.string().optional(),
    status: z.string().optional(),
    featured: z.boolean().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    page: z.number().default(1),
    pageSize: z.number().default(20),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .optional();

export type AdminProductFilters = NonNullable<z.input<typeof getAdminProductsSchema>>;

export const toggleProductActiveSchema = z.object({
  productId: z.string(),
  active: z.boolean(),
});

export type ToggleProductActiveInput = z.infer<typeof toggleProductActiveSchema>;

export const updateProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  basePrice: z.number().positive().optional(),
  salePrice: z.number().positive().optional(),
  categoryId: z.string().optional(),
  stockQuantity: z.number().min(0).optional(),
  status: z.enum(['PUBLISHED', 'DRAFT']).optional(),
  isFeatured: z.boolean().optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const deleteProductSchema = z.object({
  id: z.string(),
});

export type DeleteProductInput = z.infer<typeof deleteProductSchema>;

export const updateProductStockSchema = z.object({
  productId: z.string(),
  stockQuantity: z.number(),
  reason: z.string().optional(),
});

export type UpdateProductStockInput = z.infer<typeof updateProductStockSchema>;

export const createProductSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  basePrice: z.number(),
  salePrice: z.number().optional(),
  costPrice: z.number().optional(),
  sku: z.string(),
  stockQuantity: z.number(),
  lowStockThreshold: z.number().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  isFeatured: z.boolean().optional(),
  categoryId: z.string(),
  images: z.array(z.string()).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
