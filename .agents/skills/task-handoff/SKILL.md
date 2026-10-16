---
name: task-handoff
description: Empaqueta el estado de una tarea para transferirla a otro modelo o sesión sin perder contexto (pausas, cambios de herramienta, delegación). Úsala antes de ceder el control.
---

# Transferencia de tareas entre modelos

## Formato obligatorio (≤ 1 página)
1. Objetivo (1 frase) y criterio de término.
2. Estado actual: rama, worktree, último commit; qué está verde y qué rojo.
3. Archivos relevantes (rutas exactas) y contratos tocados.
4. Decisiones y supuestos (1 línea c/u, con el porqué).
5. Pendientes priorizados, cada uno con su siguiente acción concreta.
6. Riesgos y bloqueos (incluye trabajo concurrente de otras sesiones).
7. Evidencia: comandos ejecutados y resultados clave.

## Reglas
- Incluir siempre el comando exacto para reproducir el estado (gates).
- Nunca transferir con árbol sucio sin listar lo no commiteado.
- Si otra sesión trabaja en paralelo: señalar rutas con conflicto esperado.
- Al recibir una transferencia: reproducir los gates ANTES de tocar código.
