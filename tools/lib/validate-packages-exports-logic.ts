/**
 * Validate Package Exports — Functional Core
 */
import type { PackageJson } from '../libraries/types.js';

export interface ExportValidationResult {
  readonly packageName: string;
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

/** Check if a path exists (injectable) */
export type FileExistsFn = (p: string) => boolean;

/** Validate the main "." export entry */
export function validateExportEntry(
  pkg: PackageJson,
  pkgPath: string,
  fileExists: FileExistsFn,
): readonly string[] {
  const errors: string[] = [];
  if (!pkg.exports) {
    errors.push('No "exports" defined');
    return errors;
  }

  const mainExport = pkg.exports['.'];
  if (!mainExport) {
    errors.push('Missing main export "."');
    return errors;
  }

  const getPath = (entry: unknown): string | undefined => {
    if (!entry) {
      return undefined;
    }
    if (typeof entry === 'string') {
      return entry;
    }
    if (typeof entry === 'object' && entry !== null) {
      const e = entry as Record<string, unknown>;
      return (e.default ?? e.types) as string | undefined;
    }
    return undefined;
  };

  if (typeof mainExport === 'string') {
    if (!fileExists(`${pkgPath}/${mainExport}`)) {
      errors.push(`Main export "${mainExport}" does not exist`);
    }
  } else {
    const checks: [string, unknown][] = [
      ['types', mainExport.types],
      ['import', mainExport.import],
      ['require', mainExport.require],
    ];
    for (const [label, rawVal] of checks) {
      const val = getPath(rawVal);
      if (val && !fileExists(`${pkgPath}/${val}`)) {
        errors.push(`${label} export "${val}" does not exist`);
      }
    }
  }
  return errors;
}

/** Validate secondary export entries */
export function validateSecondaryExports(
  pkg: PackageJson,
  pkgPath: string,
  fileExists: FileExistsFn,
): readonly string[] {
  if (!pkg.exports) {
    return [];
  }
  const warnings: string[] = [];
  for (const [key, value] of Object.entries(pkg.exports)) {
    if (key === '.') {
      continue;
    }
    const exportPath = typeof value === 'string' ? value : undefined;
    if (exportPath && !fileExists(`${pkgPath}/${exportPath}`)) {
      warnings.push(`Export "${key}" may not exist: ${exportPath}`);
    }
  }
  return warnings;
}

/** Validate package-level fields (main, module, types) */
export function validatePackageFields(
  pkg: PackageJson,
  pkgPath: string,
  fileExists: FileExistsFn,
): readonly string[] {
  const warnings: string[] = [];
  if (pkg.main && !fileExists(`${pkgPath}/${pkg.main}`)) {
    warnings.push(`Main "${pkg.main}" may not exist`);
  }
  if (pkg.module && !fileExists(`${pkgPath}/${pkg.module}`)) {
    warnings.push(`Module "${pkg.module}" may not exist`);
  }
  if (pkg.types && !fileExists(`${pkgPath}/${pkg.types}`)) {
    warnings.push(`Types "${pkg.types}" may not exist`);
  }
  return warnings;
}
