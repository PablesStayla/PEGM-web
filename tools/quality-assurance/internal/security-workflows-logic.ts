export interface SecurityCheck {
  readonly name: string;
  readonly ok: boolean;
  readonly detail?: string;
}

export interface WorkflowValidationResult {
  readonly success: boolean;
  readonly checks: readonly SecurityCheck[];
  readonly failures: readonly SecurityCheck[];
}

export function createSecurityCheck(content: string, token: string, name: string): SecurityCheck {
  const ok = content.includes(token);
  return { name, ok, detail: ok ? `contains ${token}` : `missing ${token}` };
}

export function createNegativeCheck(
  content: string,
  token: string,
  name: string,
  successDetail: string,
  failureDetail: string,
): SecurityCheck {
  const ok = !content.includes(token);
  return { name, ok, detail: ok ? successDetail : failureDetail };
}

export function buildSecurityChecks(
  securityContent: string,
  codeqlContent: string,
): readonly SecurityCheck[] {
  return [
    createSecurityCheck(securityContent, 'secrets-scan', 'security:secrets-scan-job'),
    createSecurityCheck(securityContent, 'sast', 'security:sast-job'),
    createSecurityCheck(securityContent, 'sca', 'security:sca-job'),
    createSecurityCheck(securityContent, 'container-scan', 'security:container-scan-job'),
    createSecurityCheck(securityContent, 'sbom', 'security:sbom-job'),
    createSecurityCheck(securityContent, 'security-results', 'security:security-results-job'),
    createSecurityCheck(securityContent, 'gitleaks/gitleaks-action', 'security:gitleaks-action'),
    createSecurityCheck(
      securityContent,
      'dependency-check/Dependency-Check_Action',
      'security:dependency-check-action',
    ),
    createSecurityCheck(securityContent, 'aquasecurity/trivy-action', 'security:trivy-action'),
    createSecurityCheck(securityContent, 'cyclonedx-npm', 'security:sbom-generator'),
    createSecurityCheck(codeqlContent, 'codeql-action/init', 'codeql:init-step'),
    createSecurityCheck(codeqlContent, 'codeql-action/analyze', 'codeql:analyze-step'),
    createNegativeCheck(
      securityContent,
      'codeql-action/init',
      'security:no-codeql-duplication',
      'CodeQL kept out of security workflow',
      'CodeQL still present in security workflow',
    ),
  ];
}

export function validateWorkflows(
  securityContent: string,
  codeqlContent: string,
): WorkflowValidationResult {
  const checks = buildSecurityChecks(securityContent, codeqlContent);
  const failures = checks.filter((check) => !check.ok);
  return { success: failures.length === 0, checks, failures };
}

export function formatWorkflowResult(result: WorkflowValidationResult): string {
  const lines: string[] = ['\n=== Security Workflow Validation ===\n'];

  for (const check of result.checks) {
    const mark = check.ok ? 'OK' : 'FAIL';
    const detail = check.detail ?? 'n/a';
    lines.push(`${mark} ${check.name}: ${detail}`);
  }

  lines.push('');

  if (result.failures.length > 0) {
    lines.push(`Validation failed: ${result.failures.length} checks failed`);
  } else {
    lines.push('All security workflow checks passed');
  }

  return lines.join('\n');
}
