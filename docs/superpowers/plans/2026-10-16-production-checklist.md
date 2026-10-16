# Checklist de Preparación para Producción — PEGM-web

**Fecha:** 2026-10-16
**Versión:** 1.0
**Estado:** Borrador para revisión
**Referencia:** DEPLOY.md (guía completa de despliegue)

## 1. Variables de Entorno

### Obligatorias en Producción

| Variable | Descripción | Cómo obtener | Obligatoria |
| --- | --- | --- | --- |
| `AUTH_SECRET` | Secreto para firmar sesiones JWT | `openssl rand -hex 32` | ✅ Sí |
| `ADMIN_EMAIL` | Correo del administrador | Definir en primer despliegue | ✅ Sí |
| `ADMIN_PASSWORD` | Contraseña del administrador | Definir en primer despliegue | ✅ Sí |
| `TURSO_DATABASE_URL` | URL de Turso (`libsql://…`) | `turso db show <db> --url` | ⚠️ Si no, SQLite local |
| `TURSO_AUTH_TOKEN` | Token de Turso | `turso db tokens create <db>` | ⚠️ Si usa Turso |
| `NEXT_PUBLIC_SITE_URL` | URL pública para sitemap/canonical | Dominio de Vercel | ✅ Sí (producción) |

### Valores a NO usar en producción

- `ADMIN_PASSWORD=admin1234` (contraseña por defecto, se rechaza en producción)
- `ADMIN_EMAIL=admin@pablo.cl` (correo por defecto, se recomienda cambiar)

## 2. Base de Datos (Turso)

### Creación

```bash
# Instalar Turso CLI
pnpm add -g @turso/cli

# Autenticarse
turso auth signup

# Crear base de datos
turso db create pablo-site

# Obtener credenciales
turso db show pablo-site --url      # TURSO_DATABASE_URL
turso db tokens create pablo-site   # TURSO_AUTH_TOKEN
```

### Migraciones y Semilla

- Las migraciones (`drizzle/`) se aplican automáticamente en el primer arranque
- La semilla (`src/db/seed.ts`) inserta datos solo si la base está vacía
- Las credenciales de admin se validan en arranque: si faltan en producción, la app falla a propósito (fail-fast)

### Backup

- Turso maneja backups automáticamente en su infraestructura
- No hay configuración adicional requerida en el repositorio

## 3. Despliegue en Vercel

### Pasos

1. Importar el repositorio en [vercel.com/new](https://vercel.com/new)
2. Vercel detecta Next.js automáticamente
3. **Antes del primer despliegue**, añadir variables de entorno:
   - `AUTH_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `NEXT_PUBLIC_SITE_URL`
4. Hacer deploy
5. En el primer arranque, las migraciones y semilla se aplican automáticamente

### Variables de Entorno en Vercel

Ir a **Settings → Environment Variables** y añadir cada variable con su valor correspondiente.

## 4. Verificación Post-Despliegue

Ejecutar desde el repositorio local:

```bash
node scripts/verify-deploy.mjs https://tu-dominio.cl
```

### Qué verifica

| Comprobación | Qué valida |
| --- | --- |
| Portada responde 200 | Página principal accesible |
| Páginas públicas (/en, /cv, /proyectos, /laboratorio) | Todas las rutas públicas responden |
| CV PDF | Archivo PDF accesible |
| llms.txt | Archivo de IA accesible |
| Imagen Open Graph | Genera imagen PNG válida |
| JSON-LD | Contiene schema.org Person |
| Sitemap | Lista todas las rutas públicas |
| Robots.txt | Bloquea /admin y anuncia sitemap |
| Panel protegido | /admin redirige a login |
| Headers de seguridad | X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Content-Security-Policy |

### Resultado esperado

```
Todo en orden — deploy verificado.
```

o

```
N comprobación(es) fallaron.
```

## 5. Seguridad

### Verificaciones de Seguridad

| Comprobación | Estado | Notas |
| --- | --- | --- |
| `AUTH_SECRET` obligatoria en producción | ✅ | `src/lib/auth.ts` lanza si falta en producción |
| Contraseña por defecto rechazada | ✅ | `src/lib/seed-credentials.ts` |
| Contraseña de solo espacios tratada como ausente | ✅ | `src/lib/seed-credentials.ts` |
| Sesiones JWT con expiración (7 días) | ✅ | `src/lib/auth.ts` |
| Revocación de sesiones por cambio de contraseña | ✅ | `src/lib/auth.ts` + `src/lib/admin-session.ts` |
| Cookie HttpOnly + Secure (producción) | ✅ | `src/lib/auth.ts` |
| SameSite=Lax | ✅ | `src/lib/auth.ts` |
| rate limiting en formularios públicos | ✅ | `src/lib/rate-limit.ts` (5 envíos/hora por IP) |
| rate limiting en login | ✅ | `src/lib/actions/auth.ts` (5 intentos/15 min por IP+email) |
| Headers de seguridad HTTP | ✅ | `next.config.ts` (solo producción) |
| CSP restrictiva | ✅ | `next.config.ts` |

### Archivos de Secretos

- `data/*.db` está en `.gitignore` — nunca commitear
- No hay secretos hardcodeados en el repositorio
- `AUTH_SECRET` tiene valor por defecto solo para desarrollo

## 6. Rollback

En caso de problemas tras el despliegue:

1. Revertir en Vercel: **Settings → Deployments → seleccionar despliegue anterior → Redeploy**
2. Si hay cambios en la base de datos, evaluar si es necesario revertir datos manualmente
3. Las migraciones de Drizzle son idempotentes pero no se revierten automáticamente

## 7. Monitoreo

- Vercel proporciona logs de despliegue automáticamente
- Turso proporciona métricas de base de datos
- No hay configuración adicional de logs en el repositorio
- Considerar añadir logging estructurado para acciones administrativas
