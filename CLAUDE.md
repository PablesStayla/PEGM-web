# Claude AI - Guía de Uso para PranaKaia

## 🤖 MCPs Configurados

Este proyecto utiliza **Model Context Protocol (MCP)** para extender las capacidades de Claude. Los siguientes servidores están disponibles:

### Core MCPs
| MCP | Descripción | Uso Típico |
|-----|-------------|------------|
| `filesystem` | Acceso al sistema de archivos | Leer/escribir archivos del proyecto |
| `commands` | Ejecución de comandos CLI | Ejecutar scripts, tests, builds |
| `sequential-thinking` | Razonamiento paso a paso | Análisis complejos, debugging |

### Infraestructura
| MCP | Descripción | Uso Típico |
|-----|-------------|------------|
| `kubernetes` | Gestión de K8s | Ver pods, logs, deployments |
| `docker` | Gestión de Docker | Ver contenedores, imágenes, builds |

### Testing & Debugging
| MCP | Descripción | Uso Típico |
|-----|-------------|------------|
| `playwright` | Testing E2E | Ejecutar tests, debugging visual |
| `v8-deeptrace` | Chrome DevTools | Performance profiling, debugging |

### Base de Datos
| MCP | Descripción | Uso Típico |
|-----|-------------|------------|
| `supabase` | Supabase Admin | Gestionar auth, DB, storage |
| `postgres` | PostgreSQL | Queries directos a la base de datos |
| `redis` | Redis | Cache, sesiones, rate limiting |

### DevOps
| MCP | Descripción | Uso Típico |
|-----|-------------|------------|
| `github` | GitHub API | PRs, issues, workflows |

### 📁 Configuración
Los MCPs están configurados en `mcp_config.json`:
```json
{
  "servers": {
    "postgres": { "env": { "DATABASE_URL": "${DATABASE_URL}" } },
    "redis": { "env": { "REDIS_URL": "${REDIS_URL}" } },
    "supabase": { "env": { "SUPABASE_URL": "...", "SUPABASE_API_KEY": "..." } }
  }
}
```

---

## 🛠 Comandos Útiles

### Desarrollo
```bash
# Iniciar desarrollo
pnpm dev:web        # Frontend web
pnpm dev:admin      # Panel admin

# Calidad de código
pnpm lint           # Lint con Biome
pnpm type-check     # TypeScript check
pnpm format         # Formatear código
```

### Testing
```bash
pnpm test:unit              # Unit tests (Vitest)
pnpm test:e2e               # E2E tests (Playwright)
pnpm test:e2e:critical      # Tests críticos
pnpm test:mutation:critical # Mutation testing
```

### Seguridad
```bash
pnpm security:audit         # Auditar dependencias
pnpm security:secrets:check # Verificar secretos
pnpm staff:audit:strict     # Auditoría completa
```

### Base de Datos
```bash
pnpm db:backup    # Backup
pnpm db:restore   # Restaurar
pnpm db:verify    # Verificar integridad
```

---

## 🏗 Arquitectura del Proyecto

```
PranaKaia E-Commerce (Monorepo)
├── apps/
│   ├── web/           # Frontend Next.js (Client)
│   └── admin/         # Panel Admin Next.js
├── packages/
│   ├── core-domain/   # Lógica de negocio
│   ├── auth/          # Autenticación
│   ├── db/            # Drizzle ORM + PostgreSQL
│   ├── ui/            # Componentes shadcn/ui
│   ├── payments/      # Stripe + Flow
│   └── ...
├── infra/
│   ├── docker/        # Dockerfiles
│   ├── kubernetes/    # K8s manifests
│   └── supabase/      # Edge functions
└── contracts/
    └── openapi/       # Especificaciones API
```

---

## 🎯 Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 15, React 19, TypeScript 5.9 |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes, Server Actions |
| Database | PostgreSQL + Drizzle ORM |
| Cache | Redis |
| Auth | Supabase Auth |
| Payments | Stripe + Flow |
| Testing | Vitest + Playwright + Stryker |
| Lint/Format | Biome |
| Monorepo | Turbo + pnpm |

---

## ⚡ Extensiones VS Code Recomendadas

Instaladas automáticamente via `.vscode/extensions.json`:

- **Biome** - Lint + Format
- **Pretty TypeScript Errors** - Mejores mensajes de error TS
- **ErrorLens** - Errores inline
- **Vitest Explorer** - Test runner UI
- **Playwright** - E2E testing
- **Tailwind CSS IntelliSense** - Autocompletado Tailwind
- **GitLens** - Git avanzado
- **Todo Tree** - Gestión de TODOs

---

## 🔒 Seguridad

- ✅ GitLeaks para detección de secretos
- ✅ Biome security rules enabled
- ✅ Secret rotation automation
- ✅ RLS en Supabase (producción)
- ✅ Rate limiting en APIs
- ✅ Zod validation en todas las entradas

---

## 📝 Notas para Agents

1. **Siempre usar TypeScript estricto** - No usar `any`
2. **Validar con Zod** - Todas las entradas de usuario
3. **Usar Safe Actions** - Para mutaciones en servidor
4. **Documentar funciones complejas** - JSDoc para APIs públicas
5. **Loguear acciones admin** - Usar `logAdminAuditEvent`

---

## 📁 Estructura de Configuración

### Carpetas Ocultas (Dotfiles)
```
.agents/      - Contexto de Agentes AI
.devcontainer/ - VS Code Remote Containers
.github/      - Workflows de CI/CD
.turbo/       - Cache de Turbo (auto-generado)
.vscode/      - Configuración VS Code
```

### Archivos de Configuración Root
| Archivo | Propósito |
|---------|-----------|
| `lefthook.yml` | Git hooks (reemplaza Husky) - más rápido, paralelo |
| `biome.json` | Lint + Format (reemplaza ESLint + Prettier) |
| `mcp_config.json` | 13 MCPs configurados |
| `turbo.json` | Pipeline de build del monorepo |

### Lefthook vs Husky
**Lefthook es ~40% más rápido** porque:
- Ejecución en paralelo (no secuencial)
- Configuración en un solo archivo YAML
- No requiere archivos hook individuales

*Última actualización: 2026-01-04*  
*Versión: 1.0*
