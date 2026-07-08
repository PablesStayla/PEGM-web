import type { PackageJson } from '../../libraries/types.js';

export interface PackageValidationResult {
  readonly name: string;
  readonly version: string;
  readonly path: string;
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export const REQUIRED_FIELDS = ['name', 'version', 'main', 'module', 'types', 'exports'] as const;
export const RECOMMENDED_FIELDS = ['license', 'repository', 'author'] as const;

export function validateRequiredFields(pkg: PackageJson): readonly string[] {
  const errors: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    if (!(field in pkg)) {
      errors.push(`Missing required field: "${field}"`);
    }
  }

  if (!pkg.exports || Object.keys(pkg.exports).length === 0) {
    errors.push('Missing or empty "exports" field');
  }

  return errors;
}

export function validateRecommendedFields(pkg: PackageJson): readonly string[] {
  const warnings: string[] = [];

  for (const field of RECOMMENDED_FIELDS) {
    if (!(field in pkg)) {
      warnings.push(`Missing recommended field: "${field}"`);
    }
  }

  return warnings;
}

export function validateExportPaths(
  pkg: PackageJson,
  packagePath: string,
  fileExists: (p: string) => boolean,
): readonly string[] {
  const errors: string[] = [];
  if (!pkg.exports) {
    return errors;
  }

  for (const [exportPath, exportValue] of Object.entries(pkg.exports)) {
    if (typeof exportValue === 'string') {
      const filePath = `${packagePath}/${exportValue.replace('./', '')}`;
      if (!fileExists(filePath)) {
        errors.push(`Export "${exportPath}" points to non-existent file: ${exportValue}`);
      }
    }
  }

  return errors;
}

export function compilePackageValidation(
  pkg: PackageJson,
  packagePath: string,
  fileExists: (p: string) => boolean,
): PackageValidationResult {
  const errors = [
    ...validateRequiredFields(pkg),
    ...validateExportPaths(pkg, packagePath, fileExists),
  ];
  const warnings = validateRecommendedFields(pkg);

  return {
    name: pkg.name || 'unknown',
    version: pkg.version || '0.0.0',
    path: packagePath,
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
