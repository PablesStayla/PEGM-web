# Security Rules & Guardrails

> **⚔️ ABSOLUTE ZERO - Defensive Mandates**

## 🛡️ Coding Rules
1. **No Sensitive Logging**: Never log PII, passwords, tokens, or credit card numbers.
2. **Secrets Management**: Use environment variables. Never commit `.env` files or hardcode secrets.
3. **Input Sanitization**: All user-provided data must be treated as untrusted.
4. **Third-Party Risk**: New dependencies must be audited using `pnpm audit` before being added.

## 📦 Package Security
- Each package must have a valid `package.json` with defined `engines`.
- Dependencies must be pinned to specific versions (no ranges if possible for core deps).
- Private packages must be marked as `private: true`.

## 🚀 CI/CD Security
- Every PR must pass the `Security Platinum` workflow.
- Critical vulnerabilities found by CodeQL or Trivy block the merge.
- Branch protection is mandatory for `main` and `develop`.
