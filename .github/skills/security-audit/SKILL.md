---
name: security-audit
description: Realiza una auditoría de seguridad profunda del código, buscando vulnerabilidades OWASP y debilidades en la lógica de negocio.
---

# 🛡️ Security Audit Skill

## When to Use This Skill
- Before merging a Pull Request with sensitive changes (Auth, Payments, DB).
- When reviewing a new API endpoint.
- For periodic security checks of a module.

## Instructions
1. **Analyze Trust Boundaries**: Identify where external data enters the system.
2. **Check Validations**: Verify that all inputs are validated with Zod schemas.
3. **Audit Access Control**:
   - For `apps/web`: Check if server actions have proper authorization checks.
   - For `packages/db`: Verify that RLS (Row Level Security) policies cover the operations.
4. **Scan for Secrets**: Use tools or grep to ensure no API keys (Stripe, Supabase) are hardcoded.
5. **Report**:
   - List found vulnerabilities with severity (Low, Medium, High, Critical).
   - Provide a remediation plan for each.

## Guidelines
- Follow the **Absolute Zero** standard: No security through obscurity.
- Prioritize "Secure by Default" patterns.
