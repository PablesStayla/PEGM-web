/**
 * @file Database Helper
 * @description Helper functions for database operations in tests
 */

import { execSync } from 'node:child_process';

/**
 * Get database URL
 */
export function getDatabaseUrl(): string {
  return (
    process.env['DATABASE_URL'] ||
    'postgresql://pranakaia:pranakaia_dev_2024@localhost:5432/pranakaia_test'
  );
}

/**
 * Clean database (delete all data)
 */
export async function cleanDatabase() {
  // Implement database cleanup using drizzle-orm
}

/**
 * Reset database (run migrations)
 */
export async function resetDatabase() {
  execSync('pnpm drizzle:migrate', {
    env: {
      ...process.env,
      DATABASE_URL: getDatabaseUrl(),
    },
    stdio: 'inherit',
  });
}

/**
 * Seed database with test data
 */
export async function seedTestDatabase() {
  execSync('pnpm drizzle:push', {
    env: {
      ...process.env,
      DATABASE_URL: getDatabaseUrl(),
      NODE_ENV: 'test',
    },
    stdio: 'inherit',
  });
}

/**
 * Close database connection
 */
export async function disconnectDatabase() {
  // Implement disconnect logic
}

/**
 * Setup test database (clean before each test)
 */
export async function setupTestDatabase() {
  await cleanDatabase();
}

/**
 * Teardown test database (disconnect after all tests)
 */
export async function teardownTestDatabase() {
  await disconnectDatabase();
}
