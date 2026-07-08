/**
 * Cache Tags for Granular Revalidation
 *
 * Enterprise-level cache tag system for precise invalidation
 */

export const CACHE_TAGS = {
  // Products
  products: 'products',
  productById: (id: string) => `product:${id}`,
  productBySlug: (slug: string) => `product:slug:${slug}`,
  productsByCategory: (category: string) => `products:category:${category}`,
  productsByTag: (tag: string) => `products:tag:${tag}`,
  featuredProducts: 'products:featured',

  // Orders
  orders: 'orders',
  orderById: (id: string) => `order:${id}`,
  ordersByUser: (userId: string) => `orders:user:${userId}`,
  ordersByStatus: (status: string) => `orders:status:${status}`,

  // Cart
  cart: (userId: string) => `cart:${userId}`,
  cartItems: (userId: string) => `cart:${userId}:items`,

  // Users
  users: 'users',
  userById: (id: string) => `user:${id}`,

  // Categories
  categories: 'categories',
  categoryBySlug: (slug: string) => `category:${slug}`,

  // Reviews
  reviews: 'reviews',
  reviewsByProduct: (productId: string) => `reviews:product:${productId}`,

  // Inventory
  inventory: 'inventory',
  inventoryByProduct: (productId: string) => `inventory:product:${productId}`,
} as const;

/**
 * Cache durations in seconds
 */
export const CACHE_DURATION = {
  // Short-lived (1 minute)
  REALTIME: 60,

  // Medium-lived (5 minutes)
  FAST: 300,

  // Standard (1 hour)
  STANDARD: 3600,

  // Long (1 day)
  LONG: 86400,

  // Very long (1 week)
  WEEK: 604800,
} as const;

/**
 * Helper to build cache key with multiple tags
 */
export function buildCacheKey(base: string, ...tags: string[]): string {
  return [base, ...tags].join(':');
}

/**
 * Helper to get all tags for a product
 */
export function getProductTags(product: {
  id: string;
  slug: string;
  category: string;
  tags?: string[];
}): string[] {
  return [
    CACHE_TAGS.products,
    CACHE_TAGS.productById(product.id),
    CACHE_TAGS.productBySlug(product.slug),
    CACHE_TAGS.productsByCategory(product.category),
    ...(product.tags?.map((tag) => CACHE_TAGS.productsByTag(tag)) || []),
  ];
}
