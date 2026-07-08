import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { AuditResult, AuditSummary } from './tools-audit-types.js';
import {
  EssentialExtensions,
  MCPConfigSchema,
  RequiredCLIs,
  RequiredDocSections,
  RequiredMCPs,
} from './tools-audit-types.js';

export function auditMCPs(rootDir: string): readonly AuditResult[] {
  const mcpConfigPath = resolve(rootDir, 'mcp_config.json');
  if (!existsSync(mcpConfigPath)) {
    return [{ category: 'MCPs', status: 'fail', message: 'mcp_config.json not found' }];
  }

  const parsed = MCPConfigSchema.safeParse(JSON.parse(readFileSync(mcpConfigPath, 'utf-8')));
  if (!parsed.success) {
    return [
      { category: 'MCPs', status: 'fail', message: `Invalid MCP config: ${parsed.error.message}` },
    ];
  }

  const servers = Object.keys(parsed.data.servers || {});
  const missing = RequiredMCPs.filter((mcp) => !servers.includes(mcp));
  const results: AuditResult[] = [];

  results.push(
    missing.length === 0
      ? {
          category: 'MCPs',
          status: 'pass',
          message: `All required MCPs configured (${servers.length} total)`,
          details: servers,
        }
      : {
          category: 'MCPs',
          status: 'warn',
          message: `Missing MCPs: ${missing.join(', ')}`,
          details: servers,
        },
  );

  results.push(
    servers.includes('stripe')
      ? { category: 'MCPs - Stripe', status: 'pass', message: 'Stripe MCP configured' }
      : {
          category: 'MCPs - Stripe',
          status: 'warn',
          message: 'Consider adding Stripe MCP for payment management',
        },
  );

  const vscodeMcpPath = resolve(rootDir, '.vscode/mcp.json');
  results.push(
    existsSync(vscodeMcpPath)
      ? {
          category: 'MCPs - Duplication',
          status: 'warn',
          message: '.vscode/mcp.json exists - consider consolidating into mcp_config.json',
        }
      : { category: 'MCPs - Duplication', status: 'pass', message: 'No MCP config duplication' },
  );

  return results;
}

export function auditCLIs(rootDir: string): readonly AuditResult[] {
  const packageJsonPath = resolve(rootDir, 'package.json');
  if (!existsSync(packageJsonPath)) {
    return [{ category: 'CLIs', status: 'fail', message: 'package.json not found' }];
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const devDeps = Object.keys(packageJson.devDependencies || {});
  const missing = RequiredCLIs.filter((cli) => !devDeps.includes(cli.name));
  const results: AuditResult[] = [];

  results.push(
    missing.length === 0
      ? {
          category: 'CLIs',
          status: 'pass',
          message: 'All required CLIs installed',
          details: RequiredCLIs.map((c) => `${c.name} (${c.purpose})`),
        }
      : {
          category: 'CLIs',
          status: 'fail',
          message: `Missing CLIs: ${missing.map((m) => m.name).join(', ')}`,
        },
  );

  const scripts = packageJson.scripts || {};
  const requiredScripts = ['lint', 'type-check', 'test:unit', 'security:audit', 'staff:audit'];
  const missingScripts = requiredScripts.filter((s) => !scripts[s]);

  results.push(
    missingScripts.length === 0
      ? { category: 'Scripts', status: 'pass', message: 'Essential scripts configured' }
      : {
          category: 'Scripts',
          status: 'warn',
          message: `Missing scripts: ${missingScripts.join(', ')}`,
        },
  );

  return results;
}

export function auditVSCodeExtensions(rootDir: string): AuditResult {
  const extensionsPath = resolve(rootDir, '.vscode/extensions.json');
  if (!existsSync(extensionsPath)) {
    return { category: 'VS Code', status: 'fail', message: '.vscode/extensions.json not found' };
  }

  const extensions = JSON.parse(readFileSync(extensionsPath, 'utf-8'));
  const recommendations: string[] = extensions.recommendations || [];
  const missing = EssentialExtensions.filter((ext) => !recommendations.includes(ext));

  return missing.length === 0
    ? {
        category: 'VS Code',
        status: 'pass',
        message: `Essential extensions configured (${recommendations.length} total)`,
        details: recommendations,
      }
    : {
        category: 'VS Code',
        status: 'warn',
        message: `Missing extensions: ${missing.join(', ')}`,
        details: recommendations,
      };
}

export function auditBiomeConfig(rootDir: string): readonly AuditResult[] {
  const biomePath = resolve(rootDir, 'biome.json');
  if (!existsSync(biomePath)) {
    return [{ category: 'Biome', status: 'fail', message: 'biome.json not found' }];
  }

  const biome = JSON.parse(readFileSync(biomePath, 'utf-8'));
  const rules = biome.linter?.rules || {};
  const results: AuditResult[] = [];

  results.push(
    rules.performance
      ? {
          category: 'Biome - Performance',
          status: 'pass',
          message: 'Performance rules enabled',
          details: Object.keys(rules.performance),
        }
      : {
          category: 'Biome - Performance',
          status: 'warn',
          message: 'Consider adding performance rules',
          details: ['noAccumulatingSpread', 'noDelete'],
        },
  );

  results.push(
    rules.complexity?.noExcessiveCognitiveComplexity
      ? {
          category: 'Biome - Complexity',
          status: 'pass',
          message: 'noExcessiveCognitiveComplexity enabled',
        }
      : {
          category: 'Biome - Complexity',
          status: 'warn',
          message: 'Consider adding noExcessiveCognitiveComplexity',
        },
  );

  if (rules.security) {
    results.push({
      category: 'Biome - Security',
      status: 'pass',
      message: 'Security rules enabled',
    });
  }

  return results;
}

export function auditDocumentation(rootDir: string): AuditResult {
  const claudePath = resolve(rootDir, 'CLAUDE.md');
  if (!existsSync(claudePath)) {
    return { category: 'Documentation', status: 'fail', message: 'CLAUDE.md not found' };
  }

  const content = readFileSync(claudePath, 'utf-8').toLowerCase();
  const missing = RequiredDocSections.filter((s) => !content.includes(s.toLowerCase()));

  return missing.length === 0
    ? {
        category: 'Documentation',
        status: 'pass',
        message: 'CLAUDE.md contains all required sections',
      }
    : {
        category: 'Documentation',
        status: 'warn',
        message: `Missing sections in CLAUDE.md: ${missing.join(', ')}`,
      };
}

export function createAuditSummary(results: readonly AuditResult[]): AuditSummary {
  const passed = results.filter((r) => r.status === 'pass').length;
  const warned = results.filter((r) => r.status === 'warn').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  return { total: results.length, passed, warned, failed, results, hasFailures: failed > 0 };
}
