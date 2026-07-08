import { stores } from '@pranakaia/infrastructure/db';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { type CmsPage, storedCmsPageSchema } from './types';

export { getAdminStoreContext } from '@/lib/admin/store-context';

export function normalizeCmsSlug(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9/-]/g, '')
    .replace(/\/{2,}/g, '/');

  const prefixed = normalized.startsWith('/') ? normalized : `/${normalized}`;
  const withoutTrailingSlash =
    prefixed.endsWith('/') && prefixed.length > 1 ? prefixed.slice(0, -1) : prefixed;

  if (withoutTrailingSlash.length <= 1) {
    throw new Error('Slug invalido para la pagina CMS.');
  }

  return withoutTrailingSlash;
}

export function deriveExcerpt(content: string): string {
  const compact = content.replace(/\s+/g, ' ').trim();

  if (compact.length <= 160) {
    return compact;
  }

  return `${compact.slice(0, 157)}...`;
}

export function readCmsPages(settings: Record<string, unknown>): CmsPage[] {
  const rawPages = settings['cmsPages'];

  if (!Array.isArray(rawPages)) {
    return [];
  }

  return rawPages
    .map((item) => storedCmsPageSchema.safeParse(item))
    .filter((item): item is { success: true; data: CmsPage } => item.success)
    .map((item) => item.data)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function persistCmsPages(
  storeId: string,
  baseSettings: Record<string, unknown>,
  pages: CmsPage[],
): Promise<void> {
  await db
    .update(stores)
    .set({
      settings: {
        ...baseSettings,
        cmsPages: pages,
      },
      updatedAt: new Date(),
    })
    .where(eq(stores.id, storeId));
}
