import { faker } from '@faker-js/faker';

export const testDataFactories = {
  user: () => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }),

  product: () => ({
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: Number.parseFloat(faker.commerce.price()),
    sku: faker.string.alphanumeric(10).toUpperCase(),
    status: 'ACTIVE' as const,
    categoryId: 'test-category-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),

  order: (userId: string) => ({
    id: faker.string.uuid(),
    userId,
    status: 'PENDING' as const,
    total: Number.parseFloat(faker.commerce.price()),
    createdAt: new Date(),
    updatedAt: new Date(),
  }),

  orderItem: (orderId: string, productId: string) => ({
    id: faker.string.uuid(),
    orderId,
    productId,
    quantity: faker.number.int({ min: 1, max: 5 }),
    price: Number.parseFloat(faker.commerce.price()),
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
};
