import type { Result } from '@pranakaia/shared-kernel';
import type { Money, Product } from '../index';

export type SaveAggregate = (
  fn: (tx: unknown) => Promise<Result<Product, Error>>,
) => Promise<Result<Product, Error>>;

export interface CreateProductDto {
  name: string;
  description: string;
  price: Money | { amount: number; currency: string };
  stock?: number;
  sku: string;
  images?: string[];
  categoryIds?: string[];
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: Money | { amount: number; currency: string };
  stock?: number;
  sku?: string;
  images?: string[];
  categoryIds?: string[];
}
