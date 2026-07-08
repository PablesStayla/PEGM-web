import { requireAdmin } from '@pranakaia/infrastructure/auth';
import { carts, products, stores, users, webhookLogs } from '@pranakaia/infrastructure/db';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { AutomationEngine } from '@/resources/automation/AutomationEngine';

export const dynamic = 'force-dynamic';

function parseWebhookRules(settings: unknown) {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    return [];
  }

  const raw = (settings as Record<string, unknown>)['webhooks'];
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return null;
      }

      const value = item as Record<string, unknown>;
      if (
        typeof value['id'] !== 'string' ||
        typeof value['name'] !== 'string' ||
        typeof value['url'] !== 'string' ||
        typeof value['active'] !== 'boolean'
      ) {
        return null;
      }

      return {
        id: value['id'],
        name: value['name'],
        url: value['url'],
        active: value['active'],
      };
    })
    .filter(
      (rule): rule is { id: string; name: string; url: string; active: boolean } => rule !== null,
    );
}

export default async function AutomationPage() {
  const admin = await requireAdmin();
  if (!admin) {
    return (
      <div className="flex h-[80vh] items-center justify-center p-8">
        <div className="text-center luxury-card-admin p-12 max-w-md">
          <h1 className="text-2xl font-black text-white uppercase italic">Access Denied</h1>
          <p className="text-sm text-gray-500 mt-4 font-mono">
            Solo el personal de nivel Staff puede acceder al motor de automatización.
          </p>
        </div>
      </div>
    );
  }

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [adminUser] = await db
    .select({ storeId: users.storeId, tenantId: users.tenantId })
    .from(users)
    .where(eq(users.id, admin.id))
    .limit(1);

  let storeId = adminUser?.storeId ?? null;

  if (!storeId && adminUser?.tenantId) {
    const [tenantStore] = await db
      .select({ id: stores.id })
      .from(stores)
      .where(eq(stores.tenantId, adminUser.tenantId))
      .limit(1);
    storeId = tenantStore?.id ?? null;
  }

  const [store] = storeId
    ? await db
        .select({ settings: stores.settings })
        .from(stores)
        .where(eq(stores.id, storeId))
        .limit(1)
    : [];

  const webhookRules = parseWebhookRules(store?.settings ?? null);

  const [webhookStats, webhookEvents24h, lowStockCount, abandonedCartsCount, recentDeliveries] =
    await Promise.all([
      db
        .select({ status: webhookLogs.status, total: sql<number>`count(*)` })
        .from(webhookLogs)
        .where(gte(webhookLogs.createdAt, since24h))
        .groupBy(webhookLogs.status),
      db
        .select({ total: sql<number>`count(*)` })
        .from(webhookLogs)
        .where(gte(webhookLogs.createdAt, since24h)),
      db
        .select({ total: sql<number>`count(*)` })
        .from(products)
        .where(sql`${products.stockQuantity} <= COALESCE(${products.lowStockThreshold}, 10)`),
      db
        .select({ total: sql<number>`count(*)` })
        .from(carts)
        .where(and(eq(carts.status, 'abandoned'), gte(carts.updatedAt, since24h))),
      db
        .select({
          id: webhookLogs.id,
          event: webhookLogs.event,
          status: webhookLogs.status,
          source: webhookLogs.source,
          createdAt: webhookLogs.createdAt,
        })
        .from(webhookLogs)
        .orderBy(desc(webhookLogs.createdAt))
        .limit(10),
    ]);

  const successfulEvents = webhookStats.find((item) => item.status === 'SUCCESS')?.total ?? 0;
  const failedEvents = webhookStats.find((item) => item.status === 'FAILED')?.total ?? 0;
  const processingEvents = webhookStats.find((item) => item.status === 'PROCESSING')?.total ?? 0;

  const totalEvents = webhookEvents24h[0]?.total ?? 0;
  const lowStock = lowStockCount[0]?.total ?? 0;
  const abandonedCarts = abandonedCartsCount[0]?.total ?? 0;

  return (
    <AutomationEngine
      webhookRules={webhookRules}
      successfulEvents={successfulEvents}
      failedEvents={failedEvents}
      processingEvents={processingEvents}
      totalEvents={totalEvents}
      lowStock={lowStock}
      abandonedCarts={abandonedCarts}
      recentDeliveries={recentDeliveries as any}
    />
  );
}
