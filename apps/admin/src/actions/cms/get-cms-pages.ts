'use server';

import { AuthenticationError } from '@pranakaia/shared-kernel';
import { logger } from '@/lib/logger';
import { adminActionClient } from '@/lib/safe-action';
import { requireAdminPermission } from '@/lib/security/admin-rbac';
import { getAdminStoreContext, readCmsPages } from './utils';

export const getCmsPagesAction = adminActionClient.action(async ({ ctx }) => {
  const adminUser = ctx?.user;
  if (!adminUser) {
    throw new AuthenticationError();
  }

  await requireAdminPermission({ user: adminUser, resource: 'cms', action: 'read' });

  try {
    const { settings } = await getAdminStoreContext(adminUser.id);

    return {
      success: true,
      data: readCmsPages(settings),
    };
  } catch (error) {
    logger.error('Get CMS pages error', {
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected CMS error',
      data: [],
    };
  }
});
