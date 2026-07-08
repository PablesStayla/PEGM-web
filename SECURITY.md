---
# 🔐 PranaKaia Strategic Security Governance
# Role: DevSecOps, Zero-Trust & AI Guardrails
# Tier: Absolute Zero (S+)
# Compliance: SOTA Absolute Zero Taxonomy
# Last Updated: 2026-05-05
---

# Seguridad — DevSecOps, Zero-Trust & AI Guardrails

## 1. Criptografía

### Contraseñas

**Estado:** Implementado via better-auth (hash interno gestionado por la librería).

- **Objetivo:** Argon2id con parámetros: memoria 64 MB, iteraciones 3, paralelismo 4.
- **Estado actual:** better-auth maneja hashing interno con bcrypt/Argon2 según su configuración por defecto. No hay acceso directo al hash — se delega completamente en la librería.
- **Plan de migración:** Verificar en la configuración de better-auth que use Argon2id como algoritmo preferente. Si usa bcrypt por defecto, forzar Argon2id.

### Tránsito de datos

**Estado:** Implementado.

- TLS 1.3 obligatorio en todos los endpoints públicos. TLS 1.2 deshabilitado progresivamente.
- Certificados gestionados automáticamente por Vercel (web) y Let's Encrypt via cert-manager en K3s (API).
- HSTS preload habilitado con `max-age=31536000; includeSubDomains; preload`.

### Datos en reposo

**Estado:** Implementado parcialmente.

- AES-256-GCM para datos sensibles cifrados en base de datos (ej. tokens de pago, PII).
- Supabase ofrece cifrado en reposo a nivel de disco (AWS EBS encryption). Para cifrado a nivel de aplicación, usar `pgcrypto` con claves rotadas en Supabase Vault.
- **Objetivo:** Cifrar columnas PII con `pgcrypto` usando clave almacenada en Supabase Vault.

---

## 2. Sesiones y Cookies

**Estado:** Implementado via better-auth.

- **HttpOnly:** activo — cookies no accesibles desde JavaScript.
- **Secure:** activo — solo transmitidas por HTTPS.
- **SameSite:** `Lax` estricto para cookies de sesión; `Strict` para cookies críticas (CSRF token).
- Rotación de refresh tokens cada 7 días.

---

## 3. Gestión de Secretos

**Estado:** Implementado.

### Reglas obligatorias

1. **Prohibido `.env` en el repositorio.** El archivo `.env.example` documenta las variables requeridas sin valores reales.
2. **Prohibido hardcodear secrets** en código fuente. Auditado por CI (detect-secrets pre-commit hook + scan en CI).
3. **Todas las variables de entorno de producción** se inyectan en tiempo de deploy desde el proveedor correspondiente.

### Proveedores

| Plataforma | Almacenamiento de secrets |
|------------|--------------------------|
| Vercel | Environment Variables por proyecto (producción, preview, staging). Cifradas en reposo. |
| Supabase | Supabase Vault para claves de cifrado y tokens de servicio. Rotación automática disponible. |
| Docker/K8s | Secrets de Kubernetes cifrados con Sealed Secrets. |
| Local | Doppler (en evaluación) para desarrollo local. Alternativa: `direnv` + `.envrc` local (`.gitignore`). |

### Principio de mínimo privilegio

Cada deploy obtiene solo los secrets que necesita. Las GitHub Actions obtienen tokens efímeros (OIDC) en vez de secrets estáticos.

---

## 4. AI Guardrails — Filtro PII en Logs

**Estado:** OBJETIVO (no implementado)

- **Problema:** Los logs de errores o consultas pueden contener datos personales (nombres, emails, RUT). Si estos logs se envían a asistentes LLM para debugging, se exponen datos sensibles.
- **Solución:** Pipeline de preprocesamiento de logs que filtre o enmascare PII antes de cualquier envío a LLMs.
- **Campos a filtrar:** nombres completos, emails, RUT/DNI, direcciones, números de teléfono, números de tarjeta.
- **Técnica:** Regex + modelo NER local (spaCy) aplicado antes del envío. Reemplazar con `[REDACTED]` o `[EMAIL]`, `[RUT]` según tipo.
- **Trigger:** Cualquier log con severidad `error` o `fatal` que se envíe a Sentry + LLM copilot.

### Implementación propuesta

```typescript
// packages/shared/src/llm/pii-filter.ts
export function piiFilter(msg: string): string {
  return msg
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
    .replace(/\b\d{1,2}\.\d{3}\.\d{3}[-]\d{1}\b/g, '[RUT]')
    .replace(/\b\d{16}\b/g, '[CARD]');
}
```

Ubicación: filtro en middleware de logging global antes de enviar a Sentry o a cualquier AI copilot.

---

## 5. Zero-Trust Architecture

**Estado:** OBJETIVO (parcialmente implementado)

### mTLS entre servicios

**Estado:** No implementado. Evaluación en curso para el cluster K8s.

- **Objetivo:** Todo servicio que se comunica con otro debe autenticarse mutuamente vía certificados.
- **Alternativa actual:** API Key + IP whitelist entre servicios internos.
- **Herramientas:** Istio o Linkerd para malla de servicio con mTLS automático. Alternativa más liviana: cert-manager + sidecar nginx.

### Row Level Security (RLS)

**Estado:** Implementado en Supabase.

- Todas las tablas con datos de usuario tienen RLS habilitado.
- Políticas por rol: `customer`, `admin`, `service_role`.
- Los tokens JWT de better-auth se mapean directamente a roles de Supabase.
- Las consultas desde Server Actions de Next.js se autentican con `service_role` solo cuando es estrictamente necesario.

---

## 6. Rate Limiting

**Estado:** Implementado via @upstash/ratelimit.

- **Algoritmo:** Token Bucket en Edge (Upstash Redis o Vercel KV).
- **Endpoints públicos:** 100 requests/min por IP.
- **Endpoints autenticados:** 500 requests/min por usuario.
- **API (Hono):** límites más estrictos: 60 requests/min por API Key.
- **Rate limiting en Edge:** implementado como middleware de Next.js que consulta Upstash antes de procesar la request.
- **Respuesta ante rate limit:** HTTP 429 con headers `Retry-After` y `X-RateLimit-*`.

---

## 7. Supply Chain Security

**Estado:** OBJETIVO (parcialmente implementado)

### SLSA (Supply-chain Levels for Software Artifacts)

- **Objetivo:** SLSA Level 3 (build as code + hermético + reproducible). Meta: SLSA Level 4 (dos partes independientes).
- **Estado actual:** Nivel 1 (build as code, provenance básica).

### SBOM (Software Bill of Materials)

**Estado:** Implementado.

- Formato: **CycloneDX** (prioritario) y **SPDX** (compatibilidad).
- Generación automática post-merge via GitHub Action (`sbom.yml`).
- Subida a GitHub Dependency Graph.
- Escaneo de vulnerabilidades: Dependabot + Renovate.

### Renovate

**Estado:** Implementado.

- Renovate activo con schedule semanal.
- Automerge para parches de seguridad (minor/patch con tests pasando).
- PRs de actualización con changelog y diff visibles.

### Strict Pinning

**Estado:** OBJETIVO.

- **Problema:** Actualmente se usan versiones con `^` (caret) en `package.json`, permitiendo actualizaciones automáticas que pueden introducir breaking changes involuntarios.
- **Objetivo:** Migrar a versiones exactas en `package.json` y usar `pnpm update` explícitamente.
- **Plan:** Ejecutar `pnpm config set save-exact true` y migrar dependencias gradualmente. Auditoría de compatibilidad antes del cambio.
- **Tolerancia:** Solo permitimos `^` en dependencias cuyo versionado SemVer sea confiable (React, Next.js, frameworks principales).

---

## 8. Zero-Leak PII

**Estado:** OBJETIVO.

- **Logs:** enmascaramiento automático de PII antes de escritura (ver sección 4).
- **Sentry:** configurar `beforeSend` para filtrar `event.user.email`, `event.request.headers`, `event.extra`.
- **Base de datos:** cifrado de columnas PII con `pgcrypto`. Clave en Supabase Vault.
- **APIs internas:** no devolver PII en respuestas a menos que el endpoint esté explícitamente autorizado.

---

## 9. Cumplimiento Normativo

**Estado:** OBJETIVO.

### GDPR (European Union)

- **Right to be Forgotten:** endpoint `DELETE /api/user/data` que purga todas las filas asociadas al usuario en todas las tablas.
- **Data Portability:** endpoint `GET /api/user/data/export` que devuelve JSON estructurado con todos los datos del usuario.
- **Consentimiento:** registro de consentimiento para cookies no esenciales y procesamiento de datos.

### Ley 19.628 (Chile)

- **Purga de PII:** datos personales eliminados automáticamente 30 días después de la solicitud de baja del usuario.
- **Almacenamiento mínimo:** solo se almacenan datos estrictamente necesarios para la operación.
- **Comunicación:** notificación al usuario ante breach de datos en < 72 horas (GDPR) y < 24 horas (Ley 19.628 en casos graves).

---

## 10. Hardened npmrc

**Estado:** Implementado.

```ini
# .npmrc
ignore-scripts=true
engine-strict=true
save-exact=true
package-lock=false
```

- `ignore-scripts=true`: previene ejecución de scripts en dependencias descargadas.
- `engine-strict=true`: bloquea instalación si Node.js no coincide con `engines.node`.
- `save-exact=true`: pinning estricto (ver Strict Pinning).

**Nota:** `ignore-scripts=true` puede romper dependencias que requieren scripts de postinstall. Evaluar caso por caso y excepciones documentadas en `allowed-scripts.config.json`.

---

## 11. Monitoreo de Seguridad

**Estado:** Implementado parcialmente.

- **Vulnerabilidades:** Dependabot alerts + Renovate.
- **Secretos en código:** pre-commit hook con `detect-secrets` + GitHub secret scanning.
- **Logs de acceso:** audit trail de Supabase para operaciones de base de datos.
- **Penetration testing:** trimestral (terceros). Reportes archivados en `docs/security/pentests/`.