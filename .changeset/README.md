# Changesets — Guía de Uso

## ¿Qué es Changesets?

Changesets es una herramienta para gestionar versionado semántico y changelogs en monorepos. Permite:

- Especificar cambios (major, minor, patch) por PR
- Generar changelogs automáticos
- Publicar en npm con versionado semántico correcto
- Mantener sincronizadas las dependencias entre packages

## Flujo de Trabajo

### 1. Al crear un PR con cambios

Cuando hagas cambios en algún package, ejecuta:

```bash
pnpm changeset
```

Esto generará un archivo `.changeset/[random-name].md` que debes **committear** en tu PR.

### 2. Seleccionar el tipo de cambio

- **patch** (0.0.x): Bug fixes, cambios menores
- **minor** (0.x.0): Nuevas features, backward compatible
- **major** (x.0.0): Breaking changes

### 3. Revisión y Merge

Al hacer merge a `main`, el workflow de CI:
1. Valida todos los packages
2. Crea un "Version Packages PR" automáticamente
3. Al mergeear ese PR, se publican los packages en npm

## Comandos Disponibles

```bash
# Agregar un changeset (usar en cada PR con cambios)
pnpm changeset

# Ver estado de changesets pendientes
pnpm version:check

# Versionar packages (automático en CI)
pnpm version

# Publicar packages (automático en CI)
pnpm release

# Build + validación pre-release
pnpm release:check
```

## Estructura de Changeset

```md
---
"@pranakaia/cart": patch
"@pranakaia/catalog": minor
---

fix: resolver bug en cálculo de descuento

- Corregir cálculo de impuestos para productos con descuento
- Agregar tests para edge cases de redondeo
```

## Reglas

1. **Siempre** agrega un changeset si modificas un package
2. Los cambios en `packages/*` requieren changeset
3. Los cambios en `apps/*` NO requieren changeset
4. El CI validará que existan changesets en PRs a `main`

## Publicación

La publicación es **automática** cuando:
- El PR es mergeado a `main`
- Todos los checks de CI pasan
- El changeset está presente

El workflow:
1. Crea release PR con versión actualizada
2. Al mergear, publica en npm con tag `latest`
3. Crea git tag y release en GitHub

## NPM Tokens

Para publicar, se requiere:
- `NPM_TOKEN` en GitHub Secrets
- Token con permisos de `write` para `@pranakaia` org

## Referencias

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Versioning Guide](https://github.com/changesets/changesets/blob/main/docs/detailed-explanation.md)
