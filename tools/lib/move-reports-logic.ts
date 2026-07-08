/**
 * Move Reports — Functional Core
 *
 * Pure functions for report file moving.
 * Filesystem I/O injected via MovePort.
 */
export interface MoveResult {
  readonly file: string;
  readonly success: boolean;
  readonly error?: string;
}

export interface MovePort {
  stat(path: string): { isFile: boolean };
  exists(path: string): boolean;
  rename(oldPath: string, newPath: string): void;
  mkdir(path: string, opts: { recursive: boolean }): void;
  getMatchingFiles(rootDir: string): string[];
  cwd(): string;
}

/** Move a single file with backup on collision */
export function moveFile(port: MovePort, sourcePath: string, targetPath: string): MoveResult {
  try {
    if (!port.stat(sourcePath).isFile) {
      return { file: sourcePath, success: false, error: 'Not a file' };
    }
    if (port.exists(targetPath)) {
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      port.rename(targetPath, `${targetPath}.${ts}.backup`);
    }
    port.rename(sourcePath, targetPath);
    return { file: sourcePath, success: true };
  } catch (err) {
    return {
      file: sourcePath,
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Move all matching reports from root to target dir */
export function moveReports(port: MovePort, rootDir: string, targetDir: string): MoveResult[] {
  return port.getMatchingFiles(rootDir).map((file) => {
    const source = `${rootDir}/${file}`;
    const target = `${targetDir}/${file}`;
    return moveFile(port, source, target);
  });
}
