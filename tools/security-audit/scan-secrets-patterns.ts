#!/usr/bin/env tsx
/**
 * Secret Scanning Logic
 * Pure functions for detecting secrets in file content
 */

import { IGNORED_KEYS, SECRET_PATTERNS, type SecretFinding } from './define-secret-patterns.js';

/**
 * Scan file content for secrets
 * Pure function - no side effects
 */
export function scanContent(content: string, filePath: string): SecretFinding[] {
  const findings: SecretFinding[] = [];
  const lines = content.split('\n');

  for (const [lineIndex, line] of lines.entries()) {
    // Skip if line is too short or looks like a comment
    if (line.trim().startsWith('//') || line.trim().startsWith('#') || line.length < 16) {
      continue;
    }

    for (const secretPattern of SECRET_PATTERNS) {
      // Reset regex lastIndex
      secretPattern.pattern.lastIndex = 0;

      const matches = line.match(secretPattern.pattern);

      if (matches) {
        for (const match of matches) {
          // Skip if it's a known false positive
          if (IGNORED_KEYS.some((key) => match.includes(key))) {
            continue;
          }

          findings.push({
            file: filePath,
            line: lineIndex + 1,
            column: line.indexOf(match) + 1,
            pattern: secretPattern.name,
            severity: secretPattern.severity,
            description: secretPattern.description,
            excerpt: line.trim().substring(0, 80),
          });
        }
      }
    }
  }

  return findings;
}

/**
 * Scan content for a specific pattern only
 * Pure function - useful for targeted scans
 */
export function scanForPattern(
  content: string,
  filePath: string,
  patternName: string,
): SecretFinding[] {
  const targetPattern = SECRET_PATTERNS.find((p) => p.name === patternName);

  if (!targetPattern) {
    return [];
  }

  const findings: SecretFinding[] = [];
  const lines = content.split('\n');

  for (const [lineIndex, line] of lines.entries()) {
    if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
      continue;
    }

    targetPattern.pattern.lastIndex = 0;
    const matches = line.match(targetPattern.pattern);

    if (matches) {
      for (const match of matches) {
        if (IGNORED_KEYS.some((key) => match.includes(key))) {
          continue;
        }

        findings.push({
          file: filePath,
          line: lineIndex + 1,
          column: line.indexOf(match) + 1,
          pattern: targetPattern.name,
          severity: targetPattern.severity,
          description: targetPattern.description,
          excerpt: line.trim().substring(0, 80),
        });
      }
    }
  }

  return findings;
}

/**
 * Get statistics about scanned content
 * Pure function
 */
export function getScanStats(findings: readonly SecretFinding[]): {
  total: number;
  bySeverity: Record<string, number>;
  byPattern: Record<string, number>;
} {
  const bySeverity: Record<string, number> = {};
  const byPattern: Record<string, number> = {};

  for (const finding of findings) {
    bySeverity[finding.severity] = (bySeverity[finding.severity] || 0) + 1;
    byPattern[finding.pattern] = (byPattern[finding.pattern] || 0) + 1;
  }

  return {
    total: findings.length,
    bySeverity,
    byPattern,
  };
}
