import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * 🛠️ PranaKaia Shared FS Utilities (Staff Level)
 */

/**
 * Normalizes file paths to POSIX (Unix-style) format for consistency across OS.
 */
function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join('/');
}

/**
 * Recursively walks a directory and returns all file paths matching an optional extension.
 */
export function walkDir(dir: string, extension?: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) {
    return results;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath, extension));
    } else if (entry.isFile()) {
      if (!extension || entry.name.toLowerCase().endsWith(extension.toLowerCase())) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

/**
 * Reads a JSON file and returns the parsed object.
 */
export function readJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

/**
 * Gets the relative path from the current working directory in POSIX format.
 */
export function getRelativePath(filePath: string): string {
  return toPosixPath(path.relative(process.cwd(), filePath));
}
