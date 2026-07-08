import 'server-only';

import { db as baseDb } from '@pranakaia/infrastructure/db';
export const db = baseDb;
export * from '@pranakaia/infrastructure/db';
