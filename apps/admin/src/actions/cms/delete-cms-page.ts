'use server';

import { AuthenticationError } from '@pranakaia/shared-kernel';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { adminActionClient } from '@/lib/safe-action';
import { requireAdminPermission } from '@/lib/security/admin-rbac';
import { ADMIN_AUDIT_EVENTS, logAdminAuditEvent } from '@/lib/security/audit';
import { deleteCmsPageSchema } from './types';
import { getAdminStoreContext, persistCmsPages, readCmsPages } from './utils';

export const deleteCmsPageAction = adminActionClient
  .schema(deleteCmsPageSchema)
  .action(async ({ parsedInput, ctx }) => {
    const adminUser = ctx?.user;
    if (!adminUser) {
      throw new AuthenticationError();
    }

    await requireAdminPermission({
      user: adminUser,
      resource: 'cms',
      action: 'delete',
      metadata: { pageId: parsedInput.id },
    });

    try {
      const { storeId, settings } = await getAdminStoreContext(adminUser.id);
      const currentPages = readCmsPages(settings);
      const pageToDelete = currentPages.find((page) => page.id === parsedInput.id);

      if (!pageToDelete) {
        throw new Error('Pagina CMS no encontrada.');
      }

      const pagesToPersist = currentPages.filter((page) => page.id !== parsedInput.id);
      await persistCmsPages(storeId, settings, pagesToPersist);

      await logAdminAuditEvent({
        eventType: ADMIN_AUDIT_EVENTS.CMS_PAGE_DELETED,
        severity: 'warning',
        userId: adminUser.id,
        resource: 'cms',
        action: 'delete_cms_page',
        metadata: {
          pageId: pageToDelete.id,
          slug: pageToDelete.slug,
        },
      });

      revalidatePath('/cms');

      return {
        success: true,
      };
    } catch (error) {
      logger.error('Delete CMS page error', {
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected CMS error',
      };
    }
  });
