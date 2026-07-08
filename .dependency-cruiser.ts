/**
 * =============================================================================
 * 🏗️ PRANAKAIA E-COMMERCE - ARCHITECTURE GUARDIAN (DEPENDENCY-CRUISER)
 * =============================================================================
 * Role: Architectural Boundary Enforcement
 * Tier: Absolute Zero (S+)
 * Compliance: Modular Monolith Isolation
 * Last Updated: 2026-05-05
 * =============================================================================
 */

import type { IConfiguration } from 'dependency-cruiser';

const config: IConfiguration = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are strictly forbidden in AbsoluteZero S+ Grade.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'domain-isolation',
      severity: 'error',
      comment: 'Business domains must not depend on Infrastructure. They must remain agnostic.',
      from: {
        path: '^packages/(cart|catalog|checkout|pricing|identity|inventory|logistics|shipping|supplier|communications)/src',
      },
      to: {
        path: ['^packages/infrastructure', '^packages/db', '^apps/'],
      },
    },
    {
      name: 'ui-isolation',
      severity: 'error',
      comment:
        'The UI package must not depend on Infrastructure or specific business domains directly for logic. It should only use ui-components and domain types.',
      from: { path: '^packages/ui/src' },
      to: {
        path: ['^packages/infrastructure', '^packages/db', '^apps/'],
      },
    },
    {
      name: 'no-cross-domain-imports',
      severity: 'error',
      comment:
        'In a Modular Monolith, domains should communicate via Shared Kernel or Events, not direct imports of other domains.',
      from: { path: '^packages/([^/]+)/src' },
      to: {
        path: '^packages/([^/]+)/src',
        pathNot: [
          '^packages/$1/src',
          '^packages/shared-kernel',
          '^packages/config',
          '^packages/ui-components',
          '^packages/domain', // Allowed for now as it aggregates types
        ],
      },
    },
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are strictly forbidden.',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
        theme: {
          graph: {
            rankdir: 'TD',
          },
        },
      },
      archi: {
        collapsePattern: '^(packages|apps)/[^/]+',
        theme: {
          graph: {
            rankdir: 'TD',
          },
        },
      },
    },
  },
};

export default config;
