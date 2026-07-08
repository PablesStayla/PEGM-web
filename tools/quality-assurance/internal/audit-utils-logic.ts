import type { FileWalkerPort, WalkConfig } from './audit-utils-types.js';
import { DEFAULT_WALK_CONFIG } from './audit-utils-types.js';

/** Recursively walk a directory and return valid file paths (pure with DI) */
export function getAllFiles(
  dir: string,
  port: FileWalkerPort,
  config: WalkConfig = DEFAULT_WALK_CONFIG,
): string[] {
  const results: string[] = [];
  const list = port.readdirSync(dir);
  for (const file of list) {
    const fullPath = port.resolve(dir, file);
    const stat = port.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!config.excludeDirs.includes(file)) {
        results.push(...getAllFiles(fullPath, port, config));
      }
    } else {
      const ext = port.extname(file).toLowerCase();
      const fileName = port.basename(file);
      if (config.excludeFiles.includes(fileName)) {
        continue;
      }
      if (config.excludeExtensions.includes(ext)) {
        continue;
      }
      if (config.extensions.length > 0 && !config.extensions.includes(ext)) {
        continue;
      }
      if (config.maxFileSizeBytes && stat.size > config.maxFileSizeBytes) {
        continue;
      }
      results.push(fullPath);
    }
  }
  return results;
}

/** Get relative path from root (pure with DI) */
export function getRelativePath(absolutePath: string, port: FileWalkerPort): string {
  const root = port.cwd();
  const rel = port.relative(root, absolutePath);
  return rel.replace(/\\/g, '/');
}
