import { type CmsPage as CmsPageRecord, getCmsPagesAction } from '@/actions/cms-pages';
import { CmsPagesManager } from '@/resources/cms/CmsPagesManager';

export const dynamic = 'force-dynamic';

function extractCmsPages(result: unknown): CmsPageRecord[] {
  if (!result || typeof result !== 'object' || !('data' in result)) {
    return [];
  }

  const payload = (result as { data?: unknown }).data;

  if (!payload || typeof payload !== 'object' || !('data' in payload)) {
    return [];
  }

  const pages = (payload as { data?: unknown }).data;

  return Array.isArray(pages) ? (pages as CmsPageRecord[]) : [];
}

function extractServerError(result: unknown): string | null {
  if (!result || typeof result !== 'object') {
    return null;
  }

  const serverError =
    'serverError' in result ? (result as { serverError?: unknown }).serverError : null;

  return typeof serverError === 'string' ? serverError : null;
}

export default async function CmsPage() {
  const result = await getCmsPagesAction();
  const initialPages = extractCmsPages(result);
  const initialError = extractServerError(result);

  return <CmsPagesManager initialPages={initialPages} initialError={initialError} />;
}
