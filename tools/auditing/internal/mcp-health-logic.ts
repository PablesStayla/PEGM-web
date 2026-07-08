import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Result } from '../../libraries/types.js';
import { failure, success } from '../../libraries/types.js';
import type { MCPConfig, MCPHealthSummary, MCPStatus } from './mcp-health-types.js';
import { MCPConfigSchema } from './mcp-health-types.js';

export function loadMCPConfig(rootDir: string): Result<MCPConfig, string> {
  const configPath = resolve(rootDir, 'mcp_config.json');
  if (!existsSync(configPath)) {
    return failure('mcp_config.json not found');
  }
  const raw = readFileSync(configPath, 'utf-8');
  const parsed = MCPConfigSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    return failure(`Invalid MCP config: ${parsed.error.message}`);
  }
  return success(parsed.data);
}

export function checkMCPPackage(args: string[]): Result<boolean, string> {
  const packageName = args.find((arg) => arg.startsWith('@') || arg.includes('/'));
  const target = packageName || args[0];
  if (!target) {
    return failure('No package name found in args');
  }
  try {
    execSync(`npm view ${target} version --silent`, {
      stdio: 'pipe',
      timeout: 10000,
    });
    return success(true);
  } catch {
    return failure(`Package ${target} not reachable`);
  }
}

export function checkMissingEnvVars(env: Record<string, string>): readonly string[] {
  return Object.keys(env).filter((key) => {
    const value = env[key];
    return value?.startsWith('${') && !process.env[key];
  });
}

export function evaluateMCPStatus(
  name: string,
  config: { command?: string; args?: string[]; env?: Record<string, string> },
): MCPStatus {
  const status: MCPStatus = { name, configured: true, canConnect: false };

  if (config.env) {
    const missing = checkMissingEnvVars(config.env);
    if (missing.length > 0) {
      return { ...status, error: `Missing env vars: ${missing.join(', ')}` };
    }
  }

  if (config.command === 'npx' && config.args) {
    const pkgResult = checkMCPPackage(config.args);
    if (!pkgResult.success) {
      return { ...status, error: pkgResult.error };
    }
    return { ...status, canConnect: true };
  }

  return status;
}

export function createHealthSummary(results: readonly MCPStatus[]): MCPHealthSummary {
  const healthy = results.filter((r) => r.canConnect).length;
  const unhealthy = results.filter((r) => !r.canConnect).length;
  return {
    results,
    healthy,
    unhealthy,
    allHealthy: unhealthy === 0,
  };
}

export function runAllMCPChecks(rootDir: string): Result<MCPHealthSummary, string> {
  const configResult = loadMCPConfig(rootDir);
  if (!configResult.success) {
    return configResult;
  }
  const servers = Object.entries(configResult.data.servers || {});
  const results: MCPStatus[] = servers.map(([name, config]) =>
    evaluateMCPStatus(
      name,
      config as { command?: string; args?: string[]; env?: Record<string, string> },
    ),
  );
  return success(createHealthSummary(results));
}
