'use server';

import { generate2FASecret } from '@pranakaia/infrastructure/auth';
import { z } from 'zod';
import { adminActionClient } from '@/lib/safe-action';
import { enableAdminMfaForUser, issueAdminStepUpSession } from '@/lib/security/admin-mfa';
import { requireAdminPermission } from '@/lib/security/admin-rbac';
import { ADMIN_AUDIT_EVENTS, logAdminAuditEvent } from '@/lib/security/audit';

export const beginAdminMfaEnrollment = adminActionClient.action(async ({ ctx }) => {
  const adminUser = ctx?.user;
  if (!adminUser?.email) {
    throw new Error('Admin email is required to configure MFA');
  }

  await requireAdminPermission({
    user: adminUser,
    resource: 'security',
    action: 'update',
  });

  const enrollment = await generate2FASecret(adminUser.email, 'PranaKaia Admin');

  return {
    success: true,
    data: enrollment,
  };
});

const enableAdminMfaSchema = z.object({
  secret: z.string().min(16),
  token: z.string().min(6).max(16),
});

export const enableAdminMfa = adminActionClient
  .schema(enableAdminMfaSchema)
  .action(async ({ parsedInput, ctx }) => {
    const adminUser = ctx?.user;
    if (!adminUser?.email) {
      throw new Error('Admin email is required to configure MFA');
    }

    await requireAdminPermission({
      user: adminUser,
      resource: 'security',
      action: 'update',
    });

    const result = await enableAdminMfaForUser({
      userId: adminUser.id,
      email: adminUser.email,
      secret: parsedInput.secret,
      token: parsedInput.token,
    });

    const stepUpSession = await issueAdminStepUpSession(adminUser.id);

    await logAdminAuditEvent({
      eventType: ADMIN_AUDIT_EVENTS.MFA_ENABLED,
      severity: 'warning',
      userId: adminUser.id,
      resource: 'admin_security',
      action: 'enable_mfa',
      metadata: {
        backupCodesIssued: result.backupCodes.length,
      },
    });

    return {
      success: true,
      data: {
        ...result.summary,
        backupCodes: result.backupCodes,
        stepUpExpiresAt: stepUpSession.expiresAt,
      },
    };
  });
