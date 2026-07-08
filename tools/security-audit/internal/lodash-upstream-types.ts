import { z } from 'zod';

export const MIN_PATCHED_VERSION = '4.18.0';

export const DistTagsSchema = z.object({
  'dist-tags': z
    .object({
      latest: z.string().optional(),
    })
    .optional(),
});

export type DistTagsResponse = z.infer<typeof DistTagsSchema>;

export interface PackageJsonOverrides {
  overrides?: Record<string, string>;
  pnpm?: { overrides?: Record<string, string> };
}
