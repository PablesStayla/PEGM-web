import { stores, users } from '@pranakaia/infrastructure/db';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

async function getAdminUser(adminUserId: string) {
  const [adminUser] = await db
    .select({
      storeId: users.storeId,
      tenantId: users.tenantId,
    })
    .from(users)
    .where(eq(users.id, adminUserId))
    .limit(1);

  if (!adminUser) {
    throw new Error('Admin user not found');
  }

  return adminUser;
}

async function getStoreIdFromTenant(tenantId: string) {
  const [tenantStore] = await db
    .select({ id: stores.id })
    .from(stores)
    .where(eq(stores.tenantId, tenantId))
    .limit(1);

  return tenantStore?.id ?? null;
}

async function getStoreSettings(storeId: string) {
  const [store] = await db
    .select({ settings: stores.settings })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  if (!store) {
    throw new Error('Store not found');
  }

  return isRecord(store.settings) ? store.settings : {};
}

export async function getAdminStoreContext(adminUserId: string): Promise<{
  storeId: string;
  settings: Record<string, unknown>;
}> {
  const adminUser = await getAdminUser(adminUserId);

  let storeId = adminUser.storeId ?? null;

  if (!storeId && adminUser.tenantId) {
    storeId = await getStoreIdFromTenant(adminUser.tenantId);
  }

  if (!storeId) {
    throw new Error('No store found for this admin user');
  }

  const settings = await getStoreSettings(storeId);

  return {
    storeId,
    settings,
  };
}
