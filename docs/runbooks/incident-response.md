---
title: Incident Response Execution Runbook
version: 1.0.0
status: stable
owner: On-Call Engineers
last_updated: 2026-04-28
---

# 🚑 Incident Response Execution Runbook

Actionable steps for On-Call engineers to diagnose and resolve production failures.

## 1. Initial Triage & Diagnosis

Execute this triad when monitoring alerts (Sentry, Vercel, Datadog) trigger:

### 1.1 Health Verification
Check the status of the main API gateway:
- **Command**: `curl -I https://pranakaia.cl/api/health`
- **Result 503**: Vercel Edge/Serverless functions are down.
- **Result Timeout**: Database connectivity issues or Pooler exhaustion.

### 1.2 Infrastructure Audit
- **Supabase Dashboard**: Check CPU/Memory spikes and `max_connections` limit.
- **Inngest Console**: Verify "Dead Letter" queue. Re-trigger failed webhooks if the underlying bug is fixed.
- **Sentry**: Search for "New Issue" alerts related to the latest deployment.

## 2. Mitigation Actions

### 2.1 Instant Rollback (Kill-Switch)
If the incident started immediately after a deployment, revert to the last known good state:
```bash
# List recent deployments
vercel list --limit 5

# Promote stable version
vercel promote <DEPLOYMENT_ID> --scope pranakaia
```

### 2.2 Secret Rotation (Security Breach)
If secrets are exposed (e.g., leaked in logs or public repo):
1. **Revoke**: Regenerate keys in Stripe, Upstash, or Supabase.
2. **Inject**: Update Vercel Project Settings immediately.
3. **Deploy**: Force a clean deploy to purge cache: `vercel deploy --prod`.

## 3. Escalation Path

If resolution is not reached within the SLA (see [Incident Policy](../policies/INCIDENT-MANAGEMENT-POLICY.md)):
1. Notify **CTO / Tech Lead**.
2. Open a support ticket with the relevant SaaS provider (Vercel/Supabase).
3. Update the **Status Page** to inform stakeholders.

---
> [!TIP]
> Always verify if a fix requires a database migration before applying. Hotfixes that change schema must follow the [Database Migration Standard](../policies/ARCHITECTURE-STANDARD.md).
