'use server';

import { z } from 'zod';
import { adminActionClient } from '@/lib/safe-action';

const getCategoriesSchema = z.object({});

export const getCategoriesAction = adminActionClient
  .schema(getCategoriesSchema)
  .action(async () => {
    return { success: true, data: [] };
  });

// Legacy export for backwards compatibility
export const getCategories = getCategoriesAction;
