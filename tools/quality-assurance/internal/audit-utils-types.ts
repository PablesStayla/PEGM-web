/** DI port for filesystem operations */
export interface FileWalkerPort {
  readonly readdirSync: (dir: string) => string[];
  readonly statSync: (path: string) => { isDirectory(): boolean; size: number };
  readonly resolve: (...paths: string[]) => string;
  readonly extname: (path: string) => string;
  readonly basename: (path: string) => string;
  readonly cwd: () => string;
  readonly relative: (from: string, to: string) => string;
}

export interface WalkConfig {
  readonly excludeDirs: readonly string[];
  readonly excludeFiles: readonly string[];
  readonly excludeExtensions: readonly string[];
  readonly extensions: readonly string[];
  readonly maxFileSizeBytes?: number;
}

export const DEFAULT_WALK_CONFIG: WalkConfig = {
  excludeDirs: [
    '.git',
    'node_modules',
    '.next',
    '.venv',
    'dist',
    'out',
    '.turbo',
    'playwright-report',
    'coverage',
    'tmp',
    '.gemini',
    '.agents',
    'docs',
    'documentation',
    '.github',
  ],
  excludeFiles: [
    'pnpm-lock.yaml',
    'package-lock.json',
    'yarn.lock',
    'security_audit.log',
    'security_audit_v2.log',
  ],
  excludeExtensions: [
    '.exe',
    '.bin',
    '.pdf',
    '.jpg',
    '.png',
    '.zip',
    '.tar.gz',
    '.zst',
    '.webm',
    '.log',
    '.tsbuildinfo',
    '.map',
  ],
  extensions: ['.ts', '.js', '.tsx', '.jsx', '.json', '.env', '.md'],
  maxFileSizeBytes: 1024 * 500,
};
