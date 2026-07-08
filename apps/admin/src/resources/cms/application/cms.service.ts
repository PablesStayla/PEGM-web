import { db, stores, withRLS } from '@pranakaia/infrastructure/db';
import { NotFoundError, Result } from '@pranakaia/shared-kernel';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { ADMIN_AUDIT_EVENTS, logAdminAuditEvent } from '@/lib/security/audit';

export interface CmsPageData {
  slug: string;
  title: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED';
}

export class CmsService {
  /**
   * Retrieves all CMS pages.
   */
  async getPages(): Promise<Result<any[], Error>> {
    try {
      const [store] = await db.select({ settings: stores.settings }).from(stores).limit(1);
      const settings = (store?.settings as Record<string, any>) || {};
      const pages = settings.cmsPages || [];
      return Result.ok(pages);
    } catch (error) {
      logger.error('CmsService.getPages error', { error });
      return Result.err(error instanceof Error ? error : new Error('Failed to get pages'));
    }
  }

  /**
   * Upserts a CMS page.
   */
  async upsertPage(
    id: string | null,
    data: CmsPageData,
    adminId: string,
  ): Promise<Result<any, Error>> {
    try {
      const result = await withRLS(adminId, 'postgres', async () => {
        const [store] = await db.select().from(stores).limit(1);
        if (!store) {
          throw new Error('Store not found');
        }
        const settings = (store.settings as Record<string, any>) || {};
        const pages = [...(settings.cmsPages || [])];

        if (id) {
          const idx = pages.findIndex((p: any) => p.id === id);
          if (idx === -1) {
            throw new NotFoundError('CMS Page');
          }
          pages[idx] = { id, ...data, updatedAt: new Date().toISOString() };

          await db
            .update(stores)
            .set({ settings: { ...settings, cmsPages: pages } })
            .where(eq(stores.id, store.id));
          return { id, ...data };
        } else {
          const newId = crypto.randomUUID();
          pages.push({
            id: newId,
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          await db
            .update(stores)
            .set({ settings: { ...settings, cmsPages: pages } })
            .where(eq(stores.id, store.id));
          return { id: newId, ...data };
        }
      });

      await logAdminAuditEvent({
        eventType: id ? ADMIN_AUDIT_EVENTS.CMS_PAGE_UPSERTED : ADMIN_AUDIT_EVENTS.CMS_PAGE_UPSERTED,
        userId: adminId,
        resource: 'cms',
        action: id ? 'update_page' : 'create_page',
        metadata: { pageId: result.id, slug: data.slug },
      });

      return Result.ok(result);
    } catch (error) {
      logger.error('CmsService.upsertPage error', { error });
      return Result.err(error instanceof Error ? error : new Error('Failed to upsert page'));
    }
  }

  /**
   * Deletes a CMS page.
   */
  async deletePage(id: string, adminId: string): Promise<Result<void, Error>> {
    try {
      await withRLS(adminId, 'postgres', async () => {
        const [store] = await db.select().from(stores).limit(1);
        if (!store) {
          throw new Error('Store not found');
        }
        const settings = (store.settings as Record<string, any>) || {};
        const pages = (settings.cmsPages || []).filter((p: any) => p.id !== id);

        await db
          .update(stores)
          .set({ settings: { ...settings, cmsPages: pages } })
          .where(eq(stores.id, store.id));
      });

      await logAdminAuditEvent({
        eventType: ADMIN_AUDIT_EVENTS.CMS_PAGE_DELETED as any,
        userId: adminId,
        resource: 'cms',
        action: 'delete_page',
        metadata: { pageId: id },
      });

      return Result.ok(undefined);
    } catch (error) {
      logger.error('CmsService.deletePage error', { id, error });
      return Result.err(error instanceof Error ? error : new Error('Failed to delete page'));
    }
  }
}
