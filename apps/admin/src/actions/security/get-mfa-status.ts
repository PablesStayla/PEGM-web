'use server';

import { AuthenticationError } from '@pranakaia/shared-kernel';
import { adminActionClient } from '@/lib/safe-action';
import { getAdminMfaSummary } from '@/lib/security/admin-mfa';
import { requireAdminPermission } from '@/lib/security/admin-rbac';

export const getAdminMfaStatus = adminActionClient.action(async ({ ctx }) => {
  const adminUser = ctx?.user;
  if (!adminUser) {
    throw new AuthenticationError();
  }

  await requireAdminPermission({
    user: adminUser,
    resource: 'security',
    action: 'read',
  });

  return {
    success: true,
    data: await getAdminMfaSummary(adminUser.id),
  };
});
