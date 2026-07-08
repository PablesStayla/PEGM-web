// Database types to replace Prisma client types
// These types are automatically derived from the Drizzle schema

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'FAILED';

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'OUT_OF_STOCK';

export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

// Interfaces for database models
export interface User {
  id: string;
  email: string;
  passwordHash: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  role: Role;
  status: string;
  isActive: boolean;
  tenantId: string | null;
  storeId: string | null;
  lastLogin: Date | null;
  metadata: unknown | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  category: string | null;
  status: ProductStatus;
  price: number;
  cost: number | null;
  stock: number;
  sku: string | null;
  rating: number | null;
  reviewCount: number | null;
  metadata: unknown | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export interface Order {
  id: string;
  orderNumber: string | null;
  status: OrderStatus;
  customer: string | null;
  amount: number;
  currency: string | null;
  shipping: number | null;
  tax: number | null;
  notes: string | null;
  metadata: unknown | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export interface Supplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  metadata: unknown | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export interface DropshipOrder {
  id: string;
  orderNumber: string | null;
  supplierId: string | null;
  status: string;
  amount: number;
  currency: string | null;
  notes: string | null;
  metadata: unknown | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

// Prisma-like namespace for compatibility
export namespace Prisma {
  export interface ProductUpsertInput {
    create: Partial<Product>;
    update: Partial<Product>;
  }

  export interface ProductCreateInput extends Partial<Product> {}
  export interface ProductUpdateInput extends Partial<Product> {}
  export interface ProductWhereInput {
    id?: string;
    status?: ProductStatus;
    [key: string]: unknown;
  }

  export interface SupplierCreateInput extends Partial<Supplier> {}
  export interface SupplierUpdateInput extends Partial<Supplier> {}
  export interface SupplierWhereInput {
    id?: string;
    [key: string]: unknown;
  }

  export interface DropshipOrderCreateInput extends Partial<DropshipOrder> {}
  export interface DropshipOrderUpdateInput extends Partial<DropshipOrder> {}
  export interface DropshipOrderWhereInput {
    id?: string;
    status?: string;
    [key: string]: unknown;
  }
}
