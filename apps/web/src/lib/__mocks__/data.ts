/**
 * Mock Data for Testing
 *
 * Centralized mock data for consistent testing across the application
 */

export const mockProduct = {
  id: 'prod-123',
  name: 'Test Product',
  description: 'A test product for testing purposes',
  price: 99.99,
  currency: 'USD',
  stock: 100,
  imageUrl: 'https://example.com/image.jpg',
  category: 'Electronics',
  sku: 'TEST-SKU-001',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockUser = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'customer',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockOrder = {
  id: 'order-123',
  userId: 'user-123',
  items: [
    {
      productId: 'prod-123',
      quantity: 2,
      price: 99.99,
    },
  ],
  total: 199.98,
  status: 'pending',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockProducts = Array.from({ length: 10 }, (_, i) => ({
  ...mockProduct,
  id: `prod-${i + 1}`,
  name: `Test Product ${i + 1}`,
  sku: `TEST-SKU-${String(i + 1).padStart(3, '0')}`,
}));
