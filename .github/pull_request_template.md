## 🚀 Pull Request - Absolute Zero
<!-- 
  🏆 Engineering Excellence Required 
  Recuerda: Si este PR no pasa el checklist técnico, será rechazado automáticamente.
-->

### 📝 Descripción
**Objetivo:** <!-- Describe el propósito de los cambios -->
**Impacto:** <!-- Qué partes del sistema se ven afectadas -->

### 🛠️ Tipo de Cambio
- [ ] 🐛 **Bugfix** (No-breaking change que soluciona un problema)
- [ ] ✨ **Feature** (No-breaking change que añade funcionalidad)
- [ ] 💥 **Breaking Change** (Requiere migración de datos o cambio en contratos)
- [ ] ♻️ **Refactor** (Mejora estructural sin cambio funcional)
- [ ] 🛡️ **Security** (Corrección de vulnerabilidades)

### ✅ Checklist de Excelencia (S+ Grade)
<!-- Marca con una "x" lo que ya ha sido validado localmente -->

**Calidad Técnica:**
- [ ] **Type-check (0 errores)**: Ejecuté `pnpm type-check` y es impecable.
- [ ] **Lint & Format**: `pnpm lint` pasó sin warnings.
- [ ] **Coverage 100%**: He verificado que el código nuevo tiene cobertura total.
- [ ] **Complejidad Cognitiva ≤ 3**: El código es legible y modular.
- [ ] **Result Pattern**: Se utiliza el patrón `Result<T, E>` en lugar de exceptions.

**Arquitectura & Dominio:**
- [ ] **DDD Compliance**: Lógica de negocio encapsulada en Entidades/Value Objects.
- [ ] **Branded Types**: Se usan tipos nominales para IDs y campos críticos.
- [ ] **Inmutabilidad**: Objetos de dominio protegidos con `Object.freeze`.

**Seguridad:**
- [ ] **No Secrets**: Verificado localmente que no hay keys ni tokens.
- [ ] **Input Validation**: Todo input externo está validado con Zod.

### 📊 Métricas de Calidad
| Métrica | Resultado | Requerido |
|---------|-----------|-----------|
| Unit Test Coverage | % | 100% |
| Cognitive Complexity | | ≤ 3 |
| Type Safety | | Strict |

### 🖼️ Evidencia Visual
<!-- Solo si aplica a UI/UX -->
| Antes | Después |
|-------|---------|
| ![Antes]() | ![Después]() |

### 🔗 Referencias
- Closes #
- Relacionado con #
