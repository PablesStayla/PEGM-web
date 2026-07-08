'use server';

/**
 * CMS Resource Actions — Thin Wrappers
 */

import { z } from 'zod';
import { actionClient } from '@/providers/action-provider';
import { container } from '@/providers/container';
import { unwrapAsync } from '@/providers/data/result-bridge';

const upsertPageSchema = z.object({
  id: z.string().optional().nullable(),
  slug: z.string().min(1),
  title: z.string().min(1),
  content: z.string(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
});

export const upsertCmsPageAction = actionClient
  .metadata({
    actionName: 'cms.upsert_page',
    ability: { action: 'update', subject: 'CmsPage' },
  })
  .schema(upsertPageSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, ...data } = parsedInput;
    return await unwrapAsync(container.cmsService.upsertPage(id || null, data, ctx.sessionUser.id));
  });

export const deleteCmsPageAction = actionClient
  .metadata({
    actionName: 'cms.delete_page',
    ability: { action: 'delete', subject: 'CmsPage' },
  })
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    return await unwrapAsync(container.cmsService.deletePage(parsedInput.id, ctx.sessionUser.id));
  });
