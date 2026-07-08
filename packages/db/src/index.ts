import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export * from './schema';

// Connection string should come from environment variables
const connectionString =
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/pranakaia';

const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });

export type DrizzleDB = typeof db;

export { and, eq, gte, inArray, lte, ne, or, sql } from 'drizzle-orm';
