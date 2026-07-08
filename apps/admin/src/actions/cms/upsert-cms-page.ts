'use server';

import { AuthenticationError } from '@pranakaia/shared-kernel';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { adminActionClient } from '@/lib/safe-action';
import { requireAdminPermission } from '@/lib/security/admin-rbac';
import { ADMIN_AUDIT_EVENTS, logAdminAuditEvent } from '@/lib/security/audit';
import { type CmsPage, upsertCmsPageSchema } from './types';
import {
  deriveExcerpt,
  getAdminStoreContext,
  normalizeCmsSlug,
  persistCmsPages,
  readCmsPages,
} from './utils';

export const upsertCmsPageAction = adminActionClient
  .schema(upsertCmsPageSchema)
  .action(async ({ parsedInput, ctx }) => {
    const adminUser = ctx?.user;
    if (!adminUser) {
      throw new AuthenticationError();
    }

    await requireAdminPermission({
      user: adminUser,
      resource: 'cms',
      action: parsedInput.id ? 'update' : 'create',
      metadata: { pageId: parsedInput.id ?? null },
    });

    try {
      const { storeId, settings } = await getAdminStoreContext(adminUser.id);
      const currentPages = readCmsPages(settings);
      const normalizedSlug = normalizeCmsSlug(parsedInput.slug);

      const duplicateSlug = currentPages.some(
        (page) => page.slug === normalizedSlug && page.id !== parsedInput.id,
      );

      if (duplicateSlug) {
        throw new Error('Ya existe una pagina con el mismo slug.');
      }

      const now = new Date().toISOString();
      const defaultExcerpt = deriveExcerpt(parsedInput.content ?? '');

      const nextPage: CmsPage = {
        id: parsedInput.id ?? crypto.randomUUID(),
        slug: normalizedSlug,
        title: parsedInput.title.trim(),
        excerpt: (parsedInput.excerpt ?? defaultExcerpt).trim(),
        content: parsedInput.content ?? '',
        seoTitle: parsedInput.seoTitle?.trim() ?? '',
        seoDescription: parsedInput.seoDescription?.trim() ?? '',
        isPublished: parsedInput.isPublished,
        createdAt: currentPages.find((page) => page.id === parsedInput.id)?.createdAt ?? now,
        updatedAt: now,
      };

      const filtered = currentPages.filter((page) => page.id !== nextPage.id);
      const pagesToPersist = [nextPage, ...filtered].sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt),
      );

      await persistCmsPages(storeId, settings, pagesToPersist);

      await logAdminAuditEvent({
        eventType: ADMIN_AUDIT_EVENTS.CMS_PAGE_UPSERTED,
        userId: adminUser.id,
        resource: 'cms',
        action: parsedInput.id ? 'update_cms_page' : 'create_cms_page',
        metadata: {
          pageId: nextPage.id,
          slug: nextPage.slug,
          isPublished: nextPage.isPublished,
        },
      });

      revalidatePath('/cms');

      return {
        success: true,
        data: nextPage,
      };
    } catch (error) {
      logger.error('Upsert CMS page error', {
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected CMS error',
      };
    }
  });
