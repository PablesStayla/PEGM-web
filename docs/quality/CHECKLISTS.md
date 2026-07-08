# Checklist de Calidad — PranaKaia E-Commerce

## 1. Pre-Submit Checklist (Autor)

Antes de abrir un PR, el autor debe verificar:

- [ ] **Tests**: `pnpm test` pasa localmente. Los tests nuevos cubren el cambio.
- [ ] **Lint**: `pnpm lint` sin errores ni warnings.
- [ ] **Type-check**: `pnpm type-check` pasa. **Cero uso de `any`** (excepción documentada vía `// eslint-disable-next-line @typescript-eslint/no-explicit-any` con justificación).
- [ ] **Mutation Score**: Los archivos modificados tienen mutation score ≥ 80% (core-domain) o ≥ 70% (packages). Ejecutar `npx stryker run --incremental`.
- [ ] **Complejidad ciclomática**: `pnpm complexity` reporta ≤ 5 por función. Si excede, refactorizar.
- [ ] **Dead code**: `pnpm knip` no reporta exports no utilizados en archivos modificados.
- [ ] **Security scan**: `pnpm audit` sin vulnerabilidades críticas. Si hay, crear ticket de seguridad.
- [ ] **Commits**: Historia lineal, mensajes convencionales (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`).
- [ ] **Branch**: Nombre descriptivo (`feat/cart-ttl-cache`, `fix/order-total-race-condition`). No `fix-1`, `asd`.
- [ ] **PR description**: Template completado con qué, por qué, cómo testear, screenshot si aplica UI.

---

## 2. Branch Protection Rules (GitHub)

Reglas configuradas en `main` y `develop`:

- [ ] **Linear history**: `Require linear history` activado. Prohibido merge commits.
- [ ] **Signed commits**: `Require signed commits`. GPG o SSH signing obligatorio.
- [ ] **Approvals**: Mínimo **2 approvals** de maintainers.
- [ ] **CI passing**: Todos los checks obligatorios deben pasar (test, lint, type-check, build).
- [ ] **No direct push**: Protegido contra push directo. Solo PRs.
- [ ] **Outdated branches**: `Require branches to be up to date` — rebase antes de mergear.
- [ ] **Conversation resolution**: `Require conversation resolution` antes de mergear.

---

## 3. Reviewer Checklist

Al revisar un PR, verificar:

### Lógica
- [ ] El cambio resuelve el problema descrito en el PR
- [ ] No hay efectos secundarios no intencionados
- [ ] Edge cases cubiertos: valores nulos, vacíos, máximos, concurrentes
- [ ] Invariantes de dominio se mantienen después del cambio

### Tests
- [ ] Los tests nuevos son legibles y siguen Triple A
- [ ] Property-based tests existen para entidades críticas (Price, Email, RUT, Stock)
- [ ] No hay tests que mockeen lo que deberían testear con datos reales
- [ ] Mutation score aceptable en archivos modificados

### Tipos
- [ ] **Cero `any`**. Si existe, debe tener un `eslint-disable` con justificación en el comentario
- [ ] Tipos exportados tienen TSDoc
- [ ] Genéricos tipados correctamente (no `T extends any`)
- [ ] `Result<T, E>` usado en lugar de throws para errores esperados

### Manejo de errores
- [ ] Todos los resultados de `Result<T,E>` se manejan (no `.unwrap()` sin fallback)
- [ ] Errores inesperados se loguean con contexto suficiente para debugging
- [ ] No hay `catch` vacíos ni `console.error` sin tratamiento

### Inmutabilidad
- [ ] Funciones puras donde sea posible
- [ ] `ReadonlyArray<T>` sobre `T[]` en interfaces públicas
- [ ] Sin mutación de parámetros de entrada

### Naming
- [ ] Nombres descriptivos: `calculateDiscountedPrice` > `calcPrice`
- [ ] Booleanos con prefijo: `isActive`, `hasItems`, `canCheckout`
- [ ] Constantes en UPPER_SNAKE_CASE

### Documentación
- [ ] TSDoc en interfaces y funciones públicas
- [ ] ADR creado si el cambio es arquitectónico (ver sección 8)

---

## 4. Accessibility Checklist (WCAG 2.2 AA)

Aplicable a cambios en UI:

- [ ] **Semantic HTML**: `<nav>`, `<main>`, `<button>`, `<input>` sobre `<div>` con roles
- [ ] **Keyboard navigation**: Todos los interactive elements son accesibles por teclado (Tab, Enter, Escape)
- [ ] **Focus indicators visible**: Outline visible en focus, no `outline: none` sin alternativa
- [ ] **ARIA labels**: Elementos sin texto visible tienen `aria-label`
- [ ] **Color contrast**: Relación ≥ 4.5:1 para texto normal, ≥ 3:1 para texto grande
- [ ] **Alt text**: Todas las imágenes tienen `alt` descriptivo (o `alt=""` si decorativas)
- [ ] **Form errors**: Mensajes de error asociados al input vía `aria-describedby`
- [ ] **Motion**: Animaciones respetan `prefers-reduced-motion`
- [ ] **Screen reader**: Flujo de navegación lógico con landmarks
- [ ] **Language**: `<html lang="es-CL">` (Español Chile) o lang dinámico para i18n

---

## 5. i18n Checklist

- [ ] **Cero strings hardcodeados** en componentes. Todo pasa por `t('key')` o similar
- [ ] **Intl API nativa** para fechas, monedas, plurales: `Intl.DateTimeFormat`, `Intl.NumberFormat`
- [ ] **RTL-ready**: CSS con propiedades lógicas (`margin-inline-start` > `margin-left`)
- [ ] **Placeholders**: Textos con variables usan sintaxis ICU (`{count} items`) o similar
- [ ] **Traducciones completas**: El locale que se añade tiene todas las keys del default
- [ ] **Números**: `Intl.NumberFormat('es-CL')` para formato chileno (`.` para miles, `,` para decimales)

---

## 6. File Anatomy Checklist

Cada archivo debe seguir este orden:

```
// 1. Imports (orden: externos → internos, agrupados por tipo)
import { z } from 'zod';
import { Result } from '@/shared/result';
import { Email } from './Email';

// 2. Types / Interfaces
export interface CreateUserInput { ... }

// 3. Constants
const MIN_PASSWORD_LENGTH = 8;

// 4. Core Logic
export function validate(input: CreateUserInput): Result<User, Error> { ... }

// 5. Helpers (privadas, no exportadas)
function sanitizeEmail(email: string): string { ... }

// 6. Exports (si no se exportó inline)
```

---

## 7. Anti-patterns Prohibidos

| Anti-patrón | Sanción | Reemplazo |
|-------------|---------|-----------|
| `any` | Rechazo automático | `unknown` + type guard |
| Estado mutable global | Rechazo automático | Inyección de dependencias / stores |
| `if` anidados > 3 niveles | Rechazo en review | Early return, guard clauses |
| Magic numbers | Rechazo en review | Constantes con nombre |
| `try/catch` sin tipo | Rechazo en review | `Result<T,E>` |
| `console.log` en producción | CI warning → reject | Logger estructurado |
| Funciones > 50 líneas | Sugerencia de refactor | Extraer a funciones más pequeñas |
| Componentes > 200 líneas | Sugerencia de refactor | Dividir en subcomponentes |

---

## 8. Decision Framework: Cuándo crear un ADR

Crear un **Architecture Decision Record (ADR)** cuando:

1. **Elección tecnológica**: Cambiar DB, ORM, cache provider, CDN
2. **Patrón arquitectónico**: Introducir CQRS, Event Sourcing, Saga
3. **API design**: Estructura de endpoints, versioning, protocolo
4. **Estructura de paquetes**: Reorganización de monorepo, nuevo Bounded Context
5. **Deuda técnica pagada**: Refactor grande que cambia invariantes

### Template de Trade-off Analysis

```markdown
# ADR-XXX: [Título descriptivo]

## Contexto
[Problema que motiva la decisión]

## Opciones Consideradas
1. **Opción A**: [Descripción breve]
   - Pros: [lista]
   - Contras: [lista]
2. **Opción B**: [Descripción breve]
   - Pros: [lista]
   - Contras: [lista]

## Decisión
[Qué se eligió y por qué]

## Consecuencias
[Lo que ganamos, lo que perdemos, migración si aplica]

## Status
[Accepted | Proposed | Deprecated | Superseded by ADR-YYY]
```

No crear ADR para cambios triviales (renombrar variable, bug fix simple). La regla general: si hay trade-off, hay ADR.