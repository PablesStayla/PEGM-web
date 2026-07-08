---
title: "Generate Tests S+"
description: "Genera tests unitarios de alta calidad con 100% de cobertura de ramas."
---

# 🧪 Test Generation Task

Genera una suite de tests completa para el archivo seleccionado siguiendo estos criterios:

1. **Framework**: Vitest.
2. **Cobertura**: Cubre el camino feliz y TODOS los caminos de error (edge cases).
3. **Patrón**: AAA (Arrange, Act, Assert).
4. **Mocks**: Usa mocks minimalistas y realistas para dependencias externas.
5. **Domain Validation**: Si es una entidad, usa tests basados en propiedades si es posible.

Asegúrate de que el test verifique que se devuelven objetos `Result` correctos y que los errores de dominio son específicos.
