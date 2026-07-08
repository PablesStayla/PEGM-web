/**
 * Client-side types used across the web application.
 * These are simplified types for the UI layer, distinct from Prisma models.
 */

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  category?: string;
  categoryId?: string;
  slug?: string;
  stock?: number;
  featured?: boolean;
  tags?: string[];
  rating?: number;
  reviewCount?: number;
  variants?: ProductVariant[];
  specifications?: Record<string, string>;
  sku?: string;
  brand?: string;
  weight?: number;
  dimensions?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price?: number;
  stock?: number;
  sku?: string;
  attributes?: Record<string, string>;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
  label?: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatar?: string;
  phone?: string;
  addresses?: Address[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  variant?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: Address;
  trackingNumber?: string;
}

/** Sanity CMS image reference with optional alt text */
export interface SanityImage {
  _type: 'image';
  asset: { _ref: string; _type: 'reference' };
  alt?: string;
  caption?: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: SanityImage;
  excerpt?: string;
  author?: { name: string; image?: SanityImage };
  publishedAt?: string;
  /** Portable Text blocks — treated as opaque for rendering */
  body?: Record<string, unknown>[];
}

export interface Testimonial {
  _id: string;
  name: string;
  role?: string;
  company?: string;
  image?: SanityImage;
  rating?: number;
  content: string;
}
