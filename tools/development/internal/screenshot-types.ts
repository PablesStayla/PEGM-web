import { z } from 'zod';

export const ScreenshotRouteSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
});

export type ScreenshotRoute = z.infer<typeof ScreenshotRouteSchema>;

export interface ScreenshotResult {
  readonly name: string;
  readonly url: string;
  readonly path: string;
  readonly success: boolean;
  readonly error?: string;
}

export interface ScreenshotConfig {
  readonly routes: readonly ScreenshotRoute[];
  readonly outputDir: string;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
  readonly deviceScaleFactor: number;
  readonly timeoutMs: number;
}

export const ScreenshotConfigSchema = z.object({
  routes: z.array(z.object({ name: z.string().min(1), url: z.string().url() })).min(1),
  outputDir: z.string().min(1),
  viewportWidth: z.number().int().min(320).max(3840),
  viewportHeight: z.number().int().min(240).max(2160),
  deviceScaleFactor: z.number().min(1).max(4),
  timeoutMs: z.number().int().min(1000).max(60000),
});

export type ScreenshotConfigInput = z.infer<typeof ScreenshotConfigSchema>;
