'use server';

import { stores, tenants } from '@pranakaia/infrastructure/db';
import { AuthenticationError } from '@pranakaia/shared-kernel';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { adminActionClient } from '@/lib/safe-action';
import { getAdminMfaSummary, requireRecentAdminStepUp } from '@/lib/security/admin-mfa';
import { requireAdminPermission } from '@/lib/security/admin-rbac';
import { ADMIN_AUDIT_EVENTS, logAdminAuditEvent } from '@/lib/security/audit';

const updateSettingsSchema = z.object({
  tenantId: z.string().uuid(),
  storeId: z.string().uuid(),
  tenantName: z.string().min(2, 'El nombre de la organización debe tener al menos 2 caracteres'),
  storeName: z.string().min(2, 'El nombre de la tienda debe tener al menos 2 caracteres'),
  currency: z.string().length(3, 'La moneda debe ser un código de 3 letras (ej. CLP)'),
  contactEmail: z.string().email('Email de contacto inválido'),

  // Advanced Settings
  abTesting: z
    .object({
      enabled: z.boolean(),
      weightA: z.number().min(0).max(100),
    })
    .optional(),
  pprEnabled: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
  shipping: z
    .object({
      freeShippingThreshold: z.number(),
      localDeliveryConcepcion: z.boolean(),
      zones: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          price: z.number(),
        }),
      ),
    })
    .optional(),
  webhooks: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        url: z.string().url(),
        active: z.boolean(),
      }),
    )
    .optional(),
  seo: z
    .object({
      titlePrefix: z.string().optional(),
      description: z.string().optional(),
      ogImage: z.string().optional(),
      gtmId: z.string().optional(),
    })
    .optional(),
  branding: z
    .object({
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      borderRadius: z.string().optional(),
    })
    .optional(),
});

export const updateStoreSettings = adminActionClient
  .schema(updateSettingsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const adminUser = ctx?.user;
    if (!adminUser) {
      throw new AuthenticationError();
    }

    await requireAdminPermission({
      user: adminUser,
      resource: 'settings',
      action: 'update',
    });

    const {
      tenantId,
      storeId,
      tenantName,
      storeName,
      currency,
      contactEmail,
      abTesting,
      pprEnabled,
      maintenanceMode,
      shipping,
      webhooks,
      seo,
      branding,
    } = parsedInput;

    try {
      const mfaSummary = await getAdminMfaSummary(adminUser.id);
      if (!mfaSummary.mfaEnabled) {
        return {
          success: false,
          errorCode: 'MFA_REQUIRED',
          error: 'Debes activar MFA antes de modificar la configuración global.',
        };
      }

      try {
        await requireRecentAdminStepUp(adminUser.id);
      } catch {
        return {
          success: false,
          errorCode: 'STEP_UP_REQUIRED',
          error: 'Debes verificar MFA para aplicar cambios sensibles.',
        };
      }

      await db.transaction(async (tx) => {
        // 1. Update Tenant Name
        await tx
          .update(tenants)
          .set({
            name: tenantName,
            updatedAt: new Date(),
          })
          .where(eq(tenants.id, tenantId));

        const [currentStore] = await tx
          .select({ settings: stores.settings })
          .from(stores)
          .where(eq(stores.id, storeId))
          .limit(1);

        const baseSettings =
          currentStore?.settings &&
          typeof currentStore.settings === 'object' &&
          !Array.isArray(currentStore.settings)
            ? (currentStore.settings as Record<string, unknown>)
            : {};

        // 2. Update Store and its full JSONB settings
        await tx
          .update(stores)
          .set({
            name: storeName,
            settings: {
              ...baseSettings,
              currency,
              contactEmail,
              abTesting,
              pprEnabled,
              maintenanceMode,
              shipping,
              webhooks,
              seo,
              branding,
            },
            updatedAt: new Date(),
          })
          .where(eq(stores.id, storeId));
      });

      await logAdminAuditEvent({
        eventType: ADMIN_AUDIT_EVENTS.CONFIGURATION_CHANGED,
        severity: 'warning',
        userId: adminUser.id,
        resource: 'settings',
        action: 'update_store_settings',
        metadata: {
          tenantId,
          storeId,
          tenantName,
          storeName,
          currency,
          maintenanceMode,
          pprEnabled,
          webhooksCount: webhooks?.length ?? 0,
        },
      });

      revalidatePath('/settings');
      revalidatePath('/', 'layout'); // Invalidate web app cache
      return { success: true };
    } catch (error) {
      console.error('Failed to update settings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al actualizar ajustes',
      };
    }
  });
