import type { Result } from '../../libraries/types.js';
import { failure, success } from '../../libraries/types.js';
import type { PackageJsonOverrides } from './lodash-upstream-types.js';
import { DistTagsSchema, MIN_PATCHED_VERSION } from './lodash-upstream-types.js';

export function parseVersion(version: string): Result<[number, number, number], string> {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    return failure(`Invalid semver value: ${version}`);
  }
  return success([Number(match[1]), Number(match[2]), Number(match[3])]);
}

export function isGteVersion(a: string, b: string): boolean {
  const aParsed = parseVersion(a);
  const bParsed = parseVersion(b);
  if (!aParsed.success || !bParsed.success) {
    return false;
  }
  const [aMaj, aMin, aPat] = aParsed.data;
  const [bMaj, bMin, bPat] = bParsed.data;
  if (aMaj !== bMaj) {
    return aMaj > bMaj;
  }
  if (aMin !== bMin) {
    return aMin > bMin;
  }
  return aPat >= bPat;
}

export function parseDistTagsResponse(data: unknown): Result<string, string> {
  const parsed = DistTagsSchema.safeParse(data);
  if (!parsed.success) {
    return failure(`Invalid dist-tags response: ${parsed.error.message}`);
  }
  const latest = parsed.data['dist-tags']?.latest;
  if (!latest) {
    return failure('npm registry response did not include dist-tags.latest');
  }
  return success(latest);
}

export function applyPackageJsonUpdate(
  pkg: PackageJsonOverrides,
  targetVersion: string,
): PackageJsonOverrides {
  const result = { ...pkg };
  result.overrides = { ...result.overrides, lodash: targetVersion };
  result.pnpm = { ...result.pnpm, overrides: { ...result.pnpm?.overrides, lodash: targetVersion } };
  return result;
}

export function isPatchAvailable(latest: string): boolean {
  return isGteVersion(latest, MIN_PATCHED_VERSION);
}
