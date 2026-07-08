import { db } from '@pranakaia/db';

export * from '@pranakaia/db';
export { and, asc, count, desc, eq, gte, inArray, isNull, lte, ne, or, sql } from 'drizzle-orm';

// Next.js build-phase indicator to skip DB queries during static generation
export const isBuild =
  process.env.NEXT_PHASE === 'phase-production-build' || process.env.IS_BUILD === 'true';

type DBTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Export overloaded withRLS helper
export function withRLS<T>(callback: () => Promise<T>): Promise<T>;
export function withRLS<T>(
  userId: string,
  role: string,
  callback: (tx: DBTransaction) => Promise<T>,
): Promise<T>;
export async function withRLS<T>(
  arg1: string | (() => Promise<T>),
  _arg2?: string,
  arg3?: (tx: DBTransaction) => Promise<T>,
): Promise<T> {
  if (typeof arg1 === 'function') {
    return arg1();
  }
  if (typeof arg3 === 'function') {
    return db.transaction(async (tx) => {
      return arg3(tx);
    });
  }
  throw new Error('Invalid withRLS arguments');
}

// Aliases matching packages/infrastructure legacy expectations
export {
  cartItemsTable as cartItems,
  cartsTable as carts,
  categoriesTable as categories,
  orderItemsTable as orderItems,
  ordersTable as orders,
  productImagesTable as productImages,
  productsTable as products,
  sessionsTable as sessions,
  usersTable as users,
} from '@pranakaia/db';
