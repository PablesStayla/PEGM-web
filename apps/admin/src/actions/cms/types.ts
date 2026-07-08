import { z } from 'zod';

export const storedCmsPageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().default(''),
  content: z.string().default(''),
  seoTitle: z.string().default(''),
  seoDescription: z.string().default(''),
  isPublished: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CmsPage = z.infer<typeof storedCmsPageSchema>;

export const upsertCmsPageSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1).max(180),
  title: z.string().min(3).max(180),
  excerpt: z.string().max(320).optional(),
  content: z.string().max(15000).optional(),
  seoTitle: z.string().max(180).optional(),
  seoDescription: z.string().max(320).optional(),
  isPublished: z.boolean().default(false),
});

export const deleteCmsPageSchema = z.object({
  id: z.string(),
});
