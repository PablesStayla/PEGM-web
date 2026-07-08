// Stub database module for testkit
// This is a minimal stub since @pranakaia/infrastructure/db is not available

export const db = {
  query: async () => [],
  execute: async () => ({ success: true }),
} as const;

export type DbType = typeof db;
