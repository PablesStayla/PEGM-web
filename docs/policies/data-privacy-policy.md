# Policy: Data Privacy & Protection
 
> **🏆 ABSOLUTE ZERO - Privacy Sovereignty**
>
> *Version: 5.0 | Status: 🔒 Legal Governance | Scope: GDPR, CCPA, Global Compliance*
 
---
 
## 📋 Privacy Statement
 
PranaKaia is committed to protecting user privacy through "Privacy by Design." We treat customer data as a liability, not an asset. We collect the minimum data necessary and protect it with maximum rigor.
 
---
 
## 🔒 Data Classification
 
| Class | Definition | Storage Rule |
| :--- | :--- | :--- |
| **Class 1 (Public)** | Product names, public reviews. | No special requirements. |
| **Class 2 (Internal)** | Analytics, internal logs. | Masked PII, restricted access. |
| **Class 3 (Sensitive)** | Emails, addresses, names. | Encrypted at rest, RLS enforced. |
| **Class 4 (Critical)** | Payment tokens, Passwords. | Hashed (Argon2), never stored in plain text. |
 
---
 
## 🛡️ Privacy Controls
 
### 1. Data Minimization
We only store the data required for order fulfillment and legal compliance.
 
### 2. Anonymization & Masking
Logs and analytics must never contain PII. Use unique hash identifiers instead of email addresses in telemetry.
 
### 3. Right to be Forgotten (RTBF)
We provide automated tools for users to request data deletion.
- **Implementation**: Deletion of the User record triggers a cascading soft-delete or anonymization of Orders in the `Identity` context.
 
---
 
## 📡 External Data Transfers
 
Data shared with third-party processors (Stripe, Resend, Sentry) must be limited to the minimum set required for the specific transaction.
 
---
 
## 🚦 Compliance & Audit
 
- **Audit Logging**: All access to Class 3/4 data is logged and audited monthly.
- **Privacy Impact Assessment (PIA)**: Required for any new feature that collects new data types.
- **Reporting**: Any suspected data leak must be reported within 72 hours according to `INCIDENT-MANAGEMENT-POLICY.md`.
 
---
 
## 📝 Document Control
 
| Role | Responsibility |
| :--- | :--- |
| **Owner** | Legal Counsel / Data Protection Officer (DPO) |
| **Last Audit** | 2026-04-28 |
| **Next Review** | 2026-07-28 |
