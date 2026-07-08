'use server';

/**
 * CMS Resource Queries — RSC
 */

import 'server-only';
import { container } from '@/providers/container';
import { unwrapAsync } from '@/providers/data/result-bridge';

export async function getCmsPagesQuery() {
  return await unwrapAsync(container.cmsService.getPages());
}
