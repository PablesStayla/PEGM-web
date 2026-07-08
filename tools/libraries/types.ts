/**
 * Enterprise Tooling - Shared Types
 *
 * Common types used across all enterprise tools
 */

// ============================================================================
// Package Types
// ============================================================================

export interface PackageJson {
  name: string;
  version: string;
  description?: string;
  main?: string;
  module?: string;
  types?: string;
  typesVersions?: Record<string, Record<string, string[]>>;
  exports?: Record<string, string | { types?: string; default?: string }>;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  license?: string;
  repository?: {
    type: string;
    url: string;
  };
  author?:
    | string
    | {
        name: string;
        email?: string;
        url?: string;
      };
  contributors?: Array<{
    name: string;
    email?: string;
    url?: string;
  }>;
  keywords?: string[];
  files?: string[];
  bin?: Record<string, string>;
  engines?: {
    node?: string;
    pnpm?: string;
    npm?: string;
    yarn?: string;
  };
  publishConfig?: {
    registry?: string;
    access?: 'public' | 'restricted';
  };
  private?: boolean;
}

// ============================================================================
// Result Types
// ============================================================================

export type ResultSuccess<T> = { success: true; data: T };
export type ResultFailure<E> = { success: false; error: E };
export type Result<T, E = string> = ResultSuccess<T> | ResultFailure<E>;

export function success<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function failure<E = string>(error: E): Result<never, E> {
  return { success: false, error };
}

// ============================================================================
// Tool Execution Types
// ============================================================================

export interface ToolOptions {
  verbose: boolean;
  dryRun: boolean;
  json: boolean;
}

export interface ToolResult {
  success: boolean;
  exitCode: number;
  message?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// File System Types
// ============================================================================

export interface FileSystemEntry {
  path: string;
  type: 'file' | 'directory' | 'symlink';
  size?: number;
  modified?: Date;
}

// ============================================================================
// Logger Types
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, data?: any): void;
  success(message: string): void;
  step(message: string): void;
}

// ============================================================================
// Monorepo Types
// ============================================================================

export interface MonorepoPackage {
  name: string;
  version: string;
  path: string;
  packageJson: PackageJson;
}

export interface MonorepoConfig {
  packages: string[];
  root: string;
  packageManager: 'pnpm' | 'npm' | 'yarn';
}
