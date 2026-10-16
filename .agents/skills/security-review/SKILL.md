---
name: security-review
description: Revisión de seguridad enfocada para PEGM-web — secretos, autenticación, validación de entradas, base de datos, entorno y dependencias. Úsala antes de mergear cambios sensibles y como chequeo periódico.
---

# Revisión de seguridad (PEGM-web)

## Checklist
1. Secretos: nada hardcodeado; `AUTH_SECRET`/`ADMIN_*` solo por entorno;
   `.env*` fuera de git (salvo `.env.example` con placeholders).
2. Entorno: guards de producción intactos (`src/lib/auth.ts`,
   `src/lib/seed-credentials.ts`); los defaults de desarrollo jamás activos
   en producción.
3. Sesión: cookies httpOnly/secure, expiración; todo el panel admin detrás
   de sesión (`src/proxy.ts`, server actions).
4. Entradas: Zod en toda server action; nada de HTML crudo con datos de usuario.
5. BD: consultas Drizzle parametrizadas; nada de SQL concatenado; límites en
   consultas públicas.
6. Abuso: rate limiting en login y formularios públicos; errores sin filtrar
   stack ni internals.
7. Dependencias: `pnpm audit --prod --audit-level=high` limpio; PRs de
   Dependabot revisados antes de merge.
8. Egress: solo endpoints con sesión escriben BD; revalidación explícita tras
   escrituras.

## Formato de salida
- Hallazgo: severidad (alta/media/baja) · evidencia (`archivo:línea`) ·
  impacto · remediación sugerida.
- Si todo está limpio: decirlo explícitamente, separando verificado de no verificado.
