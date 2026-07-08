'use server';

import { AuthenticationError } from '@pranakaia/shared-kernel';
import { z } from 'zod';
import { adminActionClient } from '@/lib/safe-action';
import {
  disableAdminMfaForUser,
  getAdminMfaSummary,
  issueAdminStepUpSession,
  verifyAdminMfaChallenge,
} from '@/lib/security/admin-mfa';
import { requireAdminPermission } from '@/lib/security/admin-rbac';
import { ADMIN_AUDIT_EVENTS, logAdminAuditEvent } from '@/lib/security/audit';

const verifyAdminStepUpSchema = z.object({
  code: z.string().min(6).max(16),
});

export const verifyAdminStepUp = adminActionClient
  .schema(verifyAdminStepUpSchema)
  .action(async ({ parsedInput, ctx }) => {
    const adminUser = ctx?.user;
    if (!adminUser) {
      throw new AuthenticationError();
    }

    await requireAdminPermission({
      user: adminUser,
      resource: 'security',
      action: 'update',
    });

    const verification = await verifyAdminMfaChallenge({
      userId: adminUser.id,
      code: parsedInput.code,
    });

    if (!verification.valid) {
      await logAdminAuditEvent({
        eventType: ADMIN_AUDIT_EVENTS.MFA_STEP_UP_FAILED,
        severity: 'warning',
        userId: adminUser.id,
        resource: 'admin_security',
        action: 'verify_step_up',
      });

      return {
        success: false,
        error: 'Código MFA inválido',
        data: {
          mfaEnabled: true,
          backupCodesRemaining: verification.backupCodesRemaining,
        },
      };
    }

    const stepUpSession = await issueAdminStepUpSession(adminUser.id);
    const summary = await getAdminMfaSummary(adminUser.id);

    await logAdminAuditEvent({
      eventType: ADMIN_AUDIT_EVENTS.MFA_STEP_UP_VERIFIED,
      severity: 'info',
      userId: adminUser.id,
      resource: 'admin_security',
      action: 'verify_step_up',
      metadata: {
        method: verification.method,
        backupCodesRemaining: verification.backupCodesRemaining,
      },
    });

    return {
      success: true,
      data: {
        ...summary,
        stepUpExpiresAt: stepUpSession.expiresAt,
      },
    };
  });

const disableAdminMfaSchema = z.object({
  code: z.string().min(6).max(16),
});

export const disableAdminMfa = adminActionClient
  .schema(disableAdminMfaSchema)
  .action(async ({ parsedInput, ctx }) => {
    const adminUser = ctx?.user;
    if (!adminUser) {
      throw new AuthenticationError();
    }

    await requireAdminPermission({
      user: adminUser,
      resource: 'security',
      action: 'update',
    });

    const verification = await verifyAdminMfaChallenge({
      userId: adminUser.id,
      code: parsedInput.code,
    });

    if (!verification.valid) {
      return {
        success: false,
        error: 'Código MFA inválido',
      };
    }

    await disableAdminMfaForUser(adminUser.id);

    await logAdminAuditEvent({
      eventType: ADMIN_AUDIT_EVENTS.MFA_DISABLED,
      severity: 'critical',
      userId: adminUser.id,
      resource: 'admin_security',
      action: 'disable_mfa',
      metadata: {
        method: verification.method,
      },
    });

    return {
      success: true,
      data: await getAdminMfaSummary(adminUser.id),
    };
  });
