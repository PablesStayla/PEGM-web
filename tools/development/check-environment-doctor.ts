#!/usr/bin/env tsx
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createCli } from '../libraries/create-cli.js';
import {
  checkNodeVersion,
  checkNoSecrets,
  checkPnpmVersion,
  compileDoctorReport,
  getExitCode,
} from './internal/doctor-logic.js';
import type { CheckResult } from './internal/doctor-types.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
}

function runCheck(check: () => CheckResult): CheckResult {
  try {
    return check();
  } catch (err) {
    return {
      name: 'check-environment-doctor',
      passed: false,
      severity: 'required',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main(options: Options): Promise<void> {
  const results: CheckResult[] = [];

  results.push(runCheck(() => checkNodeVersion(process.version, 24)));

  results.push(
    runCheck(() => {
      try {
        const output = execSync('pnpm --version', { encoding: 'utf8' });
        return checkPnpmVersion(output, 9);
      } catch {
        return {
          name: 'pnpm version (>=9.0.0)',
          passed: false,
          severity: 'required',
          fix: 'Install pnpm: npm install -g pnpm@9',
        };
      }
    }),
  );

  results.push(
    runCheck(() => {
      const exists = existsSync(resolve('.env.local'));
      return {
        name: '.env.local exists',
        passed: exists,
        severity: 'required',
        fix: 'cp .env.example .env.local && edit with your credentials',
      };
    }),
  );

  results.push(
    runCheck(() => {
      const exists = existsSync(resolve('node_modules/.pnpm'));
      return {
        name: 'Dependencies installed',
        passed: exists,
        severity: 'required',
        fix: 'pnpm install',
      };
    }),
  );

  results.push(
    runCheck(() => {
      const exists = existsSync(resolve('.git/hooks/pre-commit'));
      return {
        name: 'Git hooks configured',
        passed: exists,
        severity: 'required',
        fix: 'pnpm exec lefthook install',
      };
    }),
  );

  results.push(
    runCheck(() => {
      const mcpPath = resolve('.vscode/mcp.json');
      if (!existsSync(mcpPath)) {
        return { name: 'No secrets in config', passed: true, severity: 'required' };
      }
      const content = readFileSync(mcpPath, 'utf8');
      return checkNoSecrets(content);
    }),
  );

  const report = compileDoctorReport(results);

  if (options.json) {
  } else {
  }

  process.exit(getExitCode(report));
}

const cli = createCli<Options>({
  name: 'dx-doctor',
  version: '2.0.0',
  description: 'Validate development environment setup',
  action: main,
});

if (process.argv[1]?.includes('check-environment-doctor')) {
  cli.parse(process.argv);
}
