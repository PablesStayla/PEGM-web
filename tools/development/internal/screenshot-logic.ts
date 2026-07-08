import type { Result } from '../../libraries/types.js';
import { failure, success } from '../../libraries/types.js';
import type {
  ScreenshotConfig,
  ScreenshotConfigInput,
  ScreenshotResult,
} from './screenshot-types.js';
import { ScreenshotConfigSchema } from './screenshot-types.js';

export function validateConfig(input: unknown): Result<ScreenshotConfig, string> {
  const parsed = ScreenshotConfigSchema.safeParse(input);
  if (!parsed.success) {
    return failure(`Invalid screenshot config: ${parsed.error.message}`);
  }
  return success(parsed.data);
}

export function buildDefaultRoutes(
  baseUrl: string,
  adminUrl: string,
): ScreenshotConfigInput['routes'] {
  return [
    { name: 'frontend-home', url: baseUrl },
    { name: 'frontend-products', url: `${baseUrl}/products` },
    { name: 'frontend-cart', url: `${baseUrl}/cart` },
    { name: 'frontend-login', url: `${baseUrl}/login` },
    { name: 'admin-dashboard', url: adminUrl },
  ];
}

export function buildScreenshotResult(
  name: string,
  url: string,
  destPath: string,
  err?: unknown,
): ScreenshotResult {
  if (err) {
    return {
      name,
      url,
      path: destPath,
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
  return { name, url, path: destPath, success: true };
}

export function formatScreenshotReport(results: readonly ScreenshotResult[]): string {
  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const lines = results.map((r) => {
    if (r.success) {
      return `  ✅ ${r.name}.png`;
    }
    return `  ❌ ${r.name}: ${r.error}`;
  });
  return [
    `Screenshot capture complete:`,
    ...lines,
    `\n  ${succeeded} succeeded, ${failed} failed`,
  ].join('\n');
}
