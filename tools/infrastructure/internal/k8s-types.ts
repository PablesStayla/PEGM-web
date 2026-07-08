import { z } from 'zod';

export const K8sFilePathSchema = z.string().min(1);

export interface K8sCheckResult {
  readonly name: string;
  readonly passed: boolean;
  readonly detail: string;
}

export interface K8sCheckReport {
  readonly total: number;
  readonly passed: number;
  readonly failed: number;
  readonly results: readonly K8sCheckResult[];
}

export const REQUIRED_K8S_FILES = [
  'infra/kubernetes/base/kustomization.yaml',
  'infra/kubernetes/base/web-deployment.yaml',
  'infra/kubernetes/base/admin-deployment.yaml',
  'infra/kubernetes/base/web-hpa.yaml',
  'infra/kubernetes/base/admin-hpa.yaml',
  'infra/kubernetes/base/web-pdb.yaml',
  'infra/kubernetes/base/admin-pdb.yaml',
  'infra/kubernetes/overlays/staging/kustomization.yaml',
  'infra/kubernetes/overlays/production/kustomization.yaml',
  'infra/gitops/argocd/pranakaia-staging-application.yaml',
  'infra/gitops/argocd/pranakaia-production-application.yaml',
] as const;

export const CONTENT_CHECKS = [
  {
    path: 'infra/kubernetes/base/kustomization.yaml',
    expected: 'resources:',
    name: 'base:kustomization-resources',
  },
  {
    path: 'infra/gitops/argocd/pranakaia-staging-application.yaml',
    expected: 'infra/kubernetes/overlays/staging',
    name: 'argocd:staging-path',
  },
  {
    path: 'infra/gitops/argocd/pranakaia-production-application.yaml',
    expected: 'infra/kubernetes/overlays/production',
    name: 'argocd:production-path',
  },
] as const;
