# 🚀 Guía de despliegue (Vercel + Turso)

El sitio está listo para producción: migraciones y semilla se aplican solas en
el primer arranque, el panel persiste en la base de datos remota y CI ya valida
lint, tests unitarios, E2E y build en cada push.

Tiempo estimado total: **~15 minutos**.

---

## 1. Crear la base de datos (Turso)

Turso es SQLite en la nube — capa gratuita generosa, perfecta para este sitio.

```bash
pnpm add -g @turso/cli
turso auth signup          # o `turso auth login` si ya tienes cuenta

turso db create pablo-site
turso db show pablo-site --url        # → TURSO_DATABASE_URL
turso db tokens create pablo-site     # → TURSO_AUTH_TOKEN
```

> Guarda ambos valores: los necesitas en el paso 3.

## 2. Subir el repositorio a tu GitHub

Si estás trabajando desde una rama, haz merge a `main`:

```bash
git push origin main
```

## 3. Importar en Vercel

1. Entra a [vercel.com/new](https://vercel.com/new) e importa el repositorio
   (Vercel detecta Next.js solo — no toques nada de build).
2. **Antes de desplegar**, añade las variables de entorno:

<!-- BEGIN:docs-sync:env -->
| Variable | Detalle |
|---|---|
| `AUTH_SECRET` | Secreto para firmar sesiones del panel (`openssl rand -hex 32`); **obligatoria en producción** |
| `ADMIN_EMAIL` | Correo del administrador; solo al sembrar la DB por primera vez |
| `ADMIN_PASSWORD` | Contraseña del administrador; solo al sembrar la DB por primera vez |
| `TURSO_DATABASE_URL` | URL de Turso (`libsql://…`); sin ella se usa SQLite local (`data/site.db`) |
| `TURSO_AUTH_TOKEN` | Token de Turso (acompaña a `TURSO_DATABASE_URL`) |
| `NEXT_PUBLIC_SITE_URL` | URL pública (sitemap, canonical, JSON-LD); solo producción |
<!-- END:docs-sync:env -->

3. Deploy. En el primer arranque el sitio aplica las migraciones y siembra el
   contenido inicial **directamente en Turso**.

## 4. Verificar

Desde el repositorio, contra tu URL de Vercel (o dominio propio):

```bash
node scripts/verify-deploy.mjs https://tu-dominio.cl
```

Comprueba: páginas públicas, imagen OG, JSON-LD, sitemap, robots.txt, panel
protegido y headers de seguridad. Debería terminar en
`Todo en orden — deploy verificado.`

También manualmente:

- [ ] La portada carga con tu nombre y contenido
- [ ] `/admin` redirige al login y puedes entrar con `ADMIN_EMAIL`/`ADMIN_PASSWORD`
- [ ] **Primer inicio de sesión → Panel → Ajustes → cambiar la contraseña**
- [ ] Crear un proyecto y verlo aparecer en la portada (persistencia en Turso)
- [ ] Enviar el formulario de contacto y verlo en Panel → Mensajes
- [ ] `https://tu-dominio.cl/sitemap.xml` muestra tu dominio

## 5. Dominio propio (opcional)

En Vercel: **Settings → Domains → Add**. Vercel te da el DNS a configurar en tu
registrador (o apunta un subdominio con `CNAME` a `cname.vercel-dns.com`).

Tras conectarlo, **actualiza `NEXT_PUBLIC_SITE_URL`** al dominio final y
redeploya (sitemap, canonical y JSON-LD usan esa variable).

## 6. Google Search Console (recomendado)

1. Verifica el dominio (registro TXT o archivo HTML).
2. Envía `https://tu-dominio.cl/sitemap.xml`.
3. Pide indexar la portada.

---

## Detalles técnicos del despliegue

- **Base de datos**: con `TURSO_DATABASE_URL` en formato `libsql://…` el sitio
  usa Turso; sin ella, cae a SQLite local (`data/site.db`). La BD de pruebas
  E2E (`data/e2e.db`) nunca se usa en producción.
- **Seguridad**: sesiones JWT HS256 en cookie `HttpOnly`+`Secure` (producción),
  `AUTH_SECRET` obligatoria en producción (falla ruidosamente si falta),
  headers `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy` y
  `Permissions-Policy` (HSTS lo añade Vercel).
- **Imagen OG**: se genera con `next/og` desde los ajustes del panel y se
  regenera cada hora (ISR). Cambiar nombre/título en Ajustes la actualiza.
- **SEO**: sitemap y robots dinámicos, canonical, JSON-LD `Person`,
  Open Graph completo.
- **Costo**: Turso free tier + Vercel Hobby = **$0** para un sitio personal.
