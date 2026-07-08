import { Redis } from 'ioredis';
import { db } from './db';

export interface TestEnvironmentConfig {
  database: {
    url: string;
  };
  redis: {
    url: string;
  };
  services: {
    identity: string;
    catalog: string;
    pricing: string;
    inventory: string;
    orders: string;
    payments: string;
    search: string;
  };
}

export class TestEnvironment {
  private redisClient: Redis;
  private envConfig: TestEnvironmentConfig;
  private isInitialized = false;

  constructor(config: TestEnvironmentConfig) {
    this.envConfig = config;
    this.redisClient = new Redis(config.redis.url);
  }

  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    await this.redisClient.ping();
    await this.runMigrations();
    await this.seedTestData();

    this.isInitialized = true;
  }

  async reset(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }
    await this.redisClient.flushdb();
    await this.seedTestData();
  }

  async cleanup(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }
    await this.redisClient.flushdb();
  }

  async close(): Promise<void> {
    await this.redisClient.quit();
    this.isInitialized = false;
  }

  private async runMigrations(): Promise<void> {
    // Migrations handled by drizzle-kit
  }

  private async seedTestData(): Promise<void> {
    // Seed test data
  }

  get client(): typeof db {
    return db;
  }

  get redis() {
    return this.redisClient;
  }

  get config() {
    return this.envConfig;
  }
}

export function createTestEnvironment(config: TestEnvironmentConfig): TestEnvironment {
  return new TestEnvironment(config);
}

export function setupTestEnvironment(config: TestEnvironmentConfig): TestEnvironment {
  return createTestEnvironment(config);
}
