# Estrategia de Deployment — PranaKaia E-Commerce

## 1. Branching Strategy: Trunk-Based Development

**Estado:** Implementado (GitFlow deprecado desde Q1 2026)

Se abandona GitFlow. El desarrollo se realiza sobre ramas cortas basadas en `main` con integración directa.

### Reglas

- **Ramas feature:** `feat/descripcion-corta` — creadas desde `main`, con TTL máximo de 48 horas.
- **Ramas hotfix:** `hotfix/descripcion-corta` — para parches críticos en producción. Puerta directa a `main` tras revisión expedita.
- **Pull Requests:** toda integración a `main` pasa por PR con revisión. Sin commits directos a `main`.
- **Protección de main:** requiere CI verde + al menos 1 approval. No se permite merge sin pass de GitHub Actions.
- **Eliminación post-merge:** la rama fuente se elimina automáticamente tras el merge.

### Por qué

- Evita divergencias largas y merges traumáticos.
- Obliga a integración continua real, no "integro cada 3 semanas".
- Compatible con feature flags (ver sección 3).

---

## 2. Targets de Deployment

**Estado:** Implementado (tres entornos definidos y operativos)

| Componente   | Plataforma        | Entorno                          |
|-------------|-------------------|----------------------------------|
| Web (Next.js)| Vercel           | 4 proyectos: preview, staging, production, admin |
| API (Hono)   | Docker / K8s     | Contenedor en cluster K3s (stg + prod) |
| Edge Functions | Supabase       | Dashboard Supabase con entornos |
| Base de datos | Supabase (Postgres) | Branching por PR en preview, promoción a prod |

### Flujo de promotion

1. **Preview:** cada PR deploya automáticamente a Vercel Preview. URL efímera para QA.
2. **Staging:** al mergear a `main`, CI deploya a staging. Smoke tests + E2E contra staging.
3. **Production:** release tag (`vX.Y.Z`) + approval manual en GitHub Actions → deploy a producción.

---

## 3. Decoupled Releases & Feature Flags

**Estado:** Implementado (Flagsmith OSS + Vercel Edge Config)

Todo feature nuevo se entrega detrás de un feature flag. El código llega a `main` y producción antes que el feature esté visible para usuarios.

### Proveedor

- **Flagsmith OSS** auto-hosted para flags persistentes (entorno, segmentos, % de rollout).
- **Vercel Edge Config** para flags de alto throughput que requieren latencia < 5ms en Edge.

### Ciclo de vida de un flag

1. **Dark Launch:** flag off. Código en prod, invisible para usuarios.
2. **Internal Test:** flag on para equipo interno (flagsmith segment).
3. **Canary:** flag al 5-10% de usuarios. Monitorear errores y métricas 24h.
4. **Progressive Rollout:** incrementar cada 12h si no hay regresión: 25% → 50% → 100%.
5. **Cleanup:** 14 días después del 100% rollout, se elimina el flag del código y se limpia de Flagsmith.

### Feature Flag Tech Debt — Zero Policy

**Estado:** OBJETIVO (parcialmente implementado, requiere auditoría de flags legacy)

- **Tolerancia cero** a flags zombies tras 14 días del rollout completo.
- CI/CD bloquea si detecta flags no limpiados dentro del plazo.
- Revisión semanal automatizada (GitHub Action + script que consulta API de Flagsmith).
- Si un flag no se ha tocado en 30 días y está al 100% en todos los entornos, se abre issue automático de cleanup.

---

## 4. CI/CD: GitHub Actions

**Estado:** Implementado (workflows existentes en `.github/workflows/`)

### Workflows activos

| Pipeline | Trigger | Acción |
|----------|---------|--------|
| `ci.yml` | PR a `main` | Lint, type-check, test unitarios + integración |
| `deploy-preview.yml` | PR a `main` | Deploy a Vercel Preview |
| `deploy-staging.yml` | Push a `main` | Deploy web + API + Edge Functions a staging |
| `deploy-production.yml` | Release tag creado | Deploy a prod (requiere approval) |
| `feature-flag-audit.yml` | Semanal | Reporta flags vencidos o no limpiados |
| `sbom.yml` | Push a `main` | Genera SBOM (CycloneDX) y sube a Dependency Graph |

### Políticas

- Pipeline completo debe pasar en < 10 minutos.
- Tests de integración contra Supabase branch de la PR.
- Cache de pnpm habilitado para acelerar instalación.

---

## 5. Reproducibilidad

**Estado:** Implementado

| Herramienta | Archivo | Rol |
|------------|---------|-----|
| DevContainers | `.devcontainer/devcontainer.json` | Entorno de desarrollo completo (VS Code + extensions + tools) |
| Node | `.nvmrc` | Node 24 (LTS forzada) |
| Package manager | `package.json` (packageManager) | pnpm 9.x |
| Docker | `Dockerfile.api` + `docker-compose.yml` | API + dependencias locales (Postgres, Redis) |

### Orden de bootstrap

```bash
git clone https://github.com/pranakaia/ecommerce
cd ecommerce
nvm use         # Node 24
pnpm install    # pnpm 9
pnpm dev        # Entorno local con hot-reload
```

---

## 6. Rollback Protocol

**Estado:** Implementado

### Rollback de Web (Vercel)

```bash
# Listar deployments
vercel list --prod

# Rollback al deployment anterior
vercel rollback --yes <deployment-id>

# Alternativa: redeployar tag anterior
git revert HEAD --no-edit
git push origin main
```

### Rollback de API (Docker/K8s)

```bash
# Rollback al deployment anterior
kubectl rollout undo deployment/api -n pranakaia

# O redeployar tag específico
kubectl set image deployment/api api=pranakaia/api:v1.2.3 -n pranakaia
```

### Rollback de Base de Datos (Supabase)

- **Schema:** migrations versionadas con Supabase CLI. Rollback ejecutando `supabase db restore --version <prev>`.
- **Data:** backups automáticos cada 5 minutos. Restore vía Dashboard o `supabase db dump --data-only`.

### Tiempos esperados

| Componente | Tiempo de rollback |
|-----------|-------------------|
| Web | < 2 min |
| API | < 1 min |
| DB (schema) | < 5 min |
| DB (data) | < 30 min (depende del volumen) |

---

## 7. Emergency Procedures

**Estado:** Implementado (runbook en documentación aparte)

| Severidad | Definición | Tiempo de respuesta | SLA |
|-----------|-----------|-------------------|-----|
| **P0** | Site down, todos los usuarios afectados | < 15 min | Recovery < 1h |
| **P1** | Funcionalidad crítica caída, usuarios parciales | < 30 min | Recovery < 4h |
| **P2** | Feature no crítico caído, sin afectar revenue | < 4h | Fix en próximo release |
| **P3** | Bug cosmético, sin impacto funcional | < 1 semana | Fix planificado |

### Protocolo P0

1. Detener deploys (congelar merges a `main`).
2. Evaluar: rollback automático vs hotfix.
3. Si rollback + smoke test pasa → deploy.
4. Si no, crear hotfix branch desde tag estable.
5. Todo incidente P0 requiere post-mortem en < 48h.

---

## 8. Disaster Recovery

**Estado:** Implementado

- **RPO (Recovery Point Objective):** 5 minutos. Backups incrementales cada 5 min via Supabase punto de restauración. Base de datos replicada en multi-AZ.
- **RTO (Recovery Time Objective):** 1 hora. Desde detección de desastre hasta servicio restaurado.
- **Estrategia:** Active-Passive. Un cluster K3s primario, failover a cluster secundario en diferente región de AWS (Chile Central → Sao Paulo).
- **Pruebas:** Ejercicio de DR trimestral con escenario simulado.

---

## 9. Hotfix Branch Workflow

**Estado:** Implementado

1. Crear `hotfix/descripcion` desde el último tag de producción.
2. Aplicar fix, test local, push.
3. PR a `main` con label `hotfix`. CI acelerado (solo test del módulo afectado).
4. Aprobación expedita (1 reviewer mínimo, idealmente skip si es trivial).
5. Merge. CI deploya a staging, smoke test rápido (< 5 min).
6. Tag release: `git tag -a vX.Y.Z-hotfix.N`.
7. Deploy a producción.
8. Backport a `development` si existe.

---

## 10. Versionado

**Estado:** Implementado

- **Formato:** `vMAJOR.MINOR.PATCH` (SemVer estricto).
- `MAJOR`: breaking changes en API o DB schema público.
- `MINOR`: nuevas features (detrás de flags).
- `PATCH`: bug fixes, hotfixes.
- Tags generados automáticamente por GitHub Actions al mergear PR con label `release:minor` o `release:patch`.