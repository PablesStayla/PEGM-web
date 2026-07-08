# 🔐 CHECKLIST DE ROTACIÓN DE SECRETOS

> **ACCIÓN URGENTE:** El archivo `.env.vercel` fue commiteado al historial de git (commit `226bf207`).
> Todos los secretos listados a continuación deben ser rotados **inmediatamente** en sus plataformas de origen.

---

## Estado de rotación

| Secreto                                             | Plataforma                                                               | Rotado | Fecha |
| --------------------------------------------------- | ------------------------------------------------------------------------ | ------ | ----- |
| `STRIPE_SECRET_KEY`                                 | [Stripe Dashboard](https://dashboard.stripe.com/apikeys)                 | ☐      |       |
| `STRIPE_WEBHOOK_SECRET`                             | [Stripe Webhooks](https://dashboard.stripe.com/webhooks)                 | ☐      |       |
| `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | [Supabase Settings → API](https://app.supabase.com)                      | ☐      |       |
| `SUPABASE_JWT_SECRET`                               | [Supabase Settings → API → JWT Secret](https://app.supabase.com)         | ☐      |       |
| `OPENAI_API_KEY`                                    | [OpenAI Platform](https://platform.openai.com/api-keys)                  | ☐      |       |
| `POSTGRES_PASSWORD`                                 | Supabase DB Settings / Proveedor PostgreSQL                              | ☐      |       |
| `JWT_SECRET`                                        | Generar nuevo valor: `openssl rand -base64 64`                           | ☐      |       |
| `JWT_REFRESH_SECRET`                                | Generar nuevo valor: `openssl rand -base64 64`                           | ☐      |       |
| `RESEND_API_KEY`                                    | [Resend Dashboard](https://resend.com/api-keys)                          | ☐      |       |
| `RESEND_WEBHOOK_SECRET`                             | [Resend Webhooks](https://resend.com/webhooks)                           | ☐      |       |
| `CLOUDFLARE_API_TOKEN`                              | [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)  | ☐      |       |
| `CLOUDINARY_API_SECRET`                             | [Cloudinary Console](https://cloudinary.com/console)                     | ☐      |       |
| `SLACK_BOT_TOKEN`                                   | [Slack API](https://api.slack.com/apps)                                  | ☐      |       |
| `ALGOLIA_API_KEY`                                   | [Algolia Dashboard](https://www.algolia.com/account/api-keys)            | ☐      |       |
| `FLOW_SECRET_KEY`                                   | [Flow Dashboard](https://www.flow.cl)                                    | ☐      |       |
| `SENTRY_AUTH_TOKEN`                                 | [Sentry Settings → Auth Tokens](https://sentry.io/settings/auth-tokens/) | ☐      |       |

---

## Pasos de remediación completa

### 1. Rotar todos los secretos (tabla de arriba)

### 2. Purgar el secreto del historial de git

```bash
# Opción A: git-filter-repo (recomendado)
pip install git-filter-repo
git filter-repo --path .env.vercel --invert-paths --force

# Opción B: BFG Repo Cleaner
java -jar bfg.jar --delete-files .env.vercel
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

> ⚠️ Después de reescribir el historial, todos los colaboradores deben hacer `git clone` fresco.

### 3. Forzar push del historial limpio

```bash
git push origin --force-with-lease --all
git push origin --force-with-lease --tags
```

### 4. Actualizar secretos en Vercel

```bash
# Usando Vercel CLI
vercel env add STRIPE_SECRET_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# ... etc para cada secreto rotado
```

### 5. Verificar que el archivo ya no es trackeable

```bash
git ls-files .env.vercel  # debe devolver vacío
git status .env.vercel    # debe decir "ignored"
```

---

_Generado automáticamente por el CQO X-Ray Engine — Sprint 1 Seguridad_
