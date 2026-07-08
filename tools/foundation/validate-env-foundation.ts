#!/usr/bin/env tsx
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
import { getRelativePath } from '../internal-platform/format-fs-paths.js';

/**
 * 🔒 Environment Variable Guard (TS SOTA)
 *
 * Validates required environment variables against .env.production.example.
 * Blocks deployment if keys are missing from the current environment.
 */

function parseKeysFromExample(examplePath: string): string[] {
  const content = fs.readFileSync(examplePath, 'utf8');
  const keys: string[] = [];
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      keys.push(trimmed.slice(0, idx));
    }
  });
  return keys;
}

function loadEnvFile(envPath: string): Record<string, string> {
  if (!fs.existsSync(envPath)) {
    return {};
  }
  try {
    return dotenv.parse(fs.readFileSync(envPath)) as Record<string, string>;
  } catch {
    return {};
  }
}

function main() {
  const examplePath = path.resolve(process.cwd(), '.env.production.example');

  if (!fs.existsSync(examplePath)) {
    console.error('❌ Missing .env.production.example in root.');
    process.exit(2);
  }

  const requiredKeys = parseKeysFromExample(examplePath);
  const envFile = path.resolve(process.cwd(), process.env.ENV_FILE || '.env.production');
  const fileVars = loadEnvFile(envFile);

  const missing: string[] = [];
  requiredKeys.forEach((k) => {
    if (fileVars[k] === undefined && process.env[k] === undefined) {
      missing.push(k);
    }
  });

  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach((k) => console.error(`   - ${k}`));
    console.error(`\n💡 Set them in your environment or update ${getRelativePath(envFile)}`);
    process.exit(1);
  }
  process.exit(0);
}

main();
