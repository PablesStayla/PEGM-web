---
title: "Review S+ Grade"
description: "Realiza una revisión de código técnica profunda basada en el estándar Absolute Zero."
---

# 🛡️ Code Review Task

Actúa como un Senior Architect de Google/Stripe. Tu tarea es revisar el código en el contexto actual y buscar violaciones de los siguientes principios:

1. **Result Pattern**: ¿Hay algún `try/catch` innecesario o funciones que lanzan errores en lugar de devolver un `Result`?
2. **Branded Types**: ¿Se están usando strings genéricos para IDs en lugar de tipos nominativos?
3. **Inmutabilidad**: ¿Hay mutación de estado en entidades de dominio?
4. **Complejidad**: ¿Alguna función supera la complejidad cognitiva de 3?
5. **DDD**: ¿La lógica de negocio está "filtrada" hacia las capas de aplicación o infraestructura?

Genera un reporte estructurado con:
- 🔴 **Crítico**: Violaciones de Absolute Zero.
- 🟡 **Mejora**: Sugerencias de limpieza o legibilidad.
- ✅ **Positivo**: Lo que se hizo bien.
