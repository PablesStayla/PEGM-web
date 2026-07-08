import * as fs from 'node:fs';
import * as path from 'node:path';
import { getAllFiles, getRelativePath } from './audit-utils-logic.js';
import type { FileWalkerPort } from './audit-utils-types.js';

/** Real filesystem port for production use */
export const realFsPort: FileWalkerPort = {
  readdirSync: (dir) => fs.readdirSync(dir),
  statSync: (p) => {
    const s = fs.statSync(p);
    return { isDirectory: () => s.isDirectory(), size: s.size };
  },
  resolve: (...paths) => path.resolve(...paths),
  extname: (p) => path.extname(p),
  basename: (p) => path.basename(p),
  cwd: () => process.cwd(),
  relative: (from, to) => path.relative(from, to),
};

/** Convenience wrapper using real filesystem */
export function walkDir(dir: string): string[] {
  return getAllFiles(dir, realFsPort);
}

/** Convenience wrapper for relative path */
export function toRelativePath(absolutePath: string): string {
  return getRelativePath(absolutePath, realFsPort);
}
