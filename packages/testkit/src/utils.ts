import { faker } from '@faker-js/faker';

export const testUtils = {
  async waitForDatabase(ms = 1000): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  },

  async waitForRedis(ms = 1000): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  },

  generateTestToken(): string {
    return `test-token-${faker.string.alphanumeric(32)}`;
  },

  generateTestId(): string {
    return faker.string.uuid();
  },
};
