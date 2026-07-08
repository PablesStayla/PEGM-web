import { db, isBuild, stores } from '@pranakaia/infrastructure/db';
import { cache } from 'react';

interface StoreSettings {
  currency?: string;
  contactEmail?: string;
  abTesting?: { enabled: boolean; weightA: number };
  pprEnabled?: boolean;
  seo?: { titlePrefix: string; description: string; ogImage: string; gtmId: string };
  branding?: { primaryColor: string; secondaryColor: string; borderRadius: string };
}

/**
 * Fetches the active store configuration.
 * Cached per request for performance.
 *
 * During Vercel's build phase (isBuild), we skip the DB call if the tenant
 * is unreachable to prevent build log pollution.
 */
export const getActiveStore = cache(async () => {
  if (isBuild) {
    // Early exit during static generation if we want to avoid DB connection attempts
    // This keeps logs clean from the XX000 "Tenant not found" error.
    return null;
  }

  try {
    const result = await db.select().from(stores).limit(1);
    const store = result[0];

    if (!store) {
      return null;
    }

    return {
      ...store,
      settings: (store.settings as StoreSettings) || {},
    };
  } catch (error) {
    // During build or runtime, we handle connection failures gracefully
    if (!isBuild) {
      console.error('Error fetching store settings:', error);
    } else {
      console.warn('⚠️ [getActiveStore] DB skipped during build — settings will load via ISR.');
    }

    return null;
  }
});
