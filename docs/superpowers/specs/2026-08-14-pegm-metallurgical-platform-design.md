# Especificación de Diseño: Plataforma SOTA PEGM — Ingeniero Civil Metalúrgico

> **Fecha:** 14 de Agosto, 2026  
> **Autor:** Pablo (Ingeniero Civil Metalúrgico) & Antigravity Lead Agent  
> **Versión:** 4.0-SOTA  
> **Estado:** Aprobado para Planificación e Implementación  

---

## 1. Resumen Ejecutivo y Objetivos

La plataforma **PEGM** es una solución digital de clase mundial (State-of-the-Art) para un **Ingeniero Civil Metalúrgico**, diseñada para combinar:
1. **Identidad Profesional & Lineup Ejecutivo:** Currículum interactivo, timeline de carrera, proyectos mineros, casos de estudio y repositorio de publicaciones científicas.
2. **Engineering Suite (Simuladores Metalúrgicos en Vivo):** Motores de cálculo puro en `@pranakaia/domain` para conminución (Bond $W_i$), flotación (balance de masa y cinética), lixiviación (consumo de ácido y cinética) y espesamiento de relaves, con gráficos interactivos y validación de límites físicos.
3. **Asistente IA Metalúrgico Multi-Provider:** Diagnóstico de planta y soporte técnico en tiempo real impulsado por Google Gemini 2.0/1.5 Flash (Free Tier) con fallback automático a Groq/Cloudflare Workers AI, streaming SSE y renderizado de fórmulas LaTeX.
4. **Portal de Consultoría & Panel Admin:** Gestión de solicitudes de asesoría técnica, métricas de simuladores y edición de contenido mediante Better Auth y Supabase.
5. **Stack 100% Free-Tier & SOTA:** Despliegue en Vercel, Supabase PostgreSQL, Upstash Redis y modelos de IA gratuitos con costo mensual cero.

---

## 2. Arquitectura de Software y Monorepo

```
PEGM-web/
├── apps/
│   ├── web/                     # Aplicación pública Next.js 15 + React 19 + Tailwind CSS v4
│   │   ├── src/app/[locale]/    # Rutas internacionalizadas (es/en) con App Router
│   │   ├── src/components/      # Componentes UI, Simuladores, Lineup, Hero, AI Chat
│   │   └── src/actions/         # Server Actions seguros con validación Zod
│   └── admin/                   # Panel de administración protegido (Better Auth + RBAC)
│       └── src/resources/       # Vistas de gestión: proyectos, publicaciones, consultas, leads
├── packages/
│   ├── domain/                  # Lógica pura de cálculo metalúrgico (zero-deps, TypeScript estricto)
│   │   ├── src/metallurgy/      # Conminución, Flotación, Lixiviación, Relaves, Hidráulica
│   │   └── src/index.ts         # Exportaciones canónicas
│   ├── shared-kernel/           # Result monad, Money, CircuitBreaker, Branded Types
│   ├── ui/                      # Sistema de diseño con tokens, Tailwind v4 y Glassmorphism
│   ├── db/                      # Esquemas Drizzle ORM + Migraciones Supabase PostgreSQL
│   └── config/                  # Configuraciones compartidas (Biome, Vitest, TypeScript)
├── tools/                       # Automatización, auditoría de seguridad, métricas y testing
├── docs/                        # Documentación técnica, manuales de fórmulas y guías
└── .agents/skills/              # Skills oficiales instaladas para agentes de IA
```

---

## 3. Especificación de Módulos Funcionales

### 3.1. Executive Hero & Interactive Career Lineup
- **Hero Principal:** Título profesional, fotografía en alta definición, badges de especialidad mineralógica, llamada a la acción para consultoría y descarga de CV en PDF.
- **Timeline Interactivo (Lineup):** Filtros por categorías (Operación de Planta, I+D Metalúrgico, Simulación CFD/Procesos, Consultoría). Cada hito incluye responsabilidades, tecnologías y logros cuantificables.
- **Catálogo de Proyectos & Casos de Estudio:** Presentación de proyectos mineros destacados con métricas antes/después (recuperación, throughput $t/h$, consumo energético $kWh/t$).
- **Repositorio de Publicaciones:** Listado de papers técnicos con abstract modal, citación BibTeX y enlace/descarga de documento PDF.

### 3.2. Engineering Suite (Simuladores Metalúrgicos)
Todos los cálculos son ejecutados por funciones puras con tipado estricto y unidades físicas explícitas:

1. **Simulador de Conminución & Molienda (Bond Work Index):**
   - Ecuación de Bond:
     $$W = 10 \cdot W_i \cdot \left(\frac{1}{\sqrt{P_{80}}} - \frac{1}{\sqrt{F_{80}}}\right)$$
   - Potencia de accionamiento requerida ($kW$) para tonelaje $T$ ($t/h$): $P = W \cdot T$.
   - Dimensionamiento preliminar de molinos de bolas y SAG.
   - Validación física: Rechazo automático si $P_{80} \ge F_{80}$ o $W_i \le 0$.

2. **Simulador de Concentración por Flotación:**
   - Balance de masa de 2 productos:
     $$F = C + T$$
     $$F \cdot f = C \cdot c + T \cdot t$$
     $$R = \frac{C \cdot c}{F \cdot f} \cdot 100\% = \frac{c \cdot (f - t)}{f \cdot (c - t)} \cdot 100\%$$
   - Cinética de flotación (Modelo de primer orden de Klimpel):
     $$R(t) = R_{\infty} \cdot \left[1 - \frac{1 - e^{-k \cdot t}}{k \cdot t}\right]$$
   - Gráficos interactivos de Ley vs. Recuperación y Cinética temporal.

3. **Simulador de Hidrometalurgia & Lixiviación:**
   - Consumo de ácido específico ($kg \text{ } H_2SO_4 / t \text{ mineral}$).
   - Balances de cobre en soluciones PLS ($g/L Cu$) e ILS.
   - Curva cinética de extracción en pilas.

4. **Simulador de Espesamiento y Manejo de Relaves:**
   - Densidad de pulpa y concentración de sólidos en peso ($\%Cp_w$):
     $$\%Cp_w = \frac{\rho_s \cdot (\rho_p - \rho_w)}{\rho_p \cdot (\rho_s - \rho_w)} \cdot 100$$
   - Área requerida de espesador según tasa de flujo unitario ($t/m^2 \cdot d$).

### 3.3. Asistente IA Metalúrgico Multi-Provider (Free-Tier SOTA)
- **Ruta API:** Server-Sent Events (SSE) o Vercel AI SDK stream.
- **Proveedores:** 
  1. Google Gemini 2.0 / 1.5 Flash (Free Tier) como motor primario (alta velocidad, contexto multimodal).
  2. Groq (Llama-3.3-70b-versatile) como fallback automático ante agotamiento de cuota o latencia.
- **System Prompt Metalúrgico:** Conocimiento especializado en metalurgia extractiva chilena e internacional, normativas SERNAGEOMIN, fórmulas en LaTeX y advertencias de seguridad física en planta.

### 3.4. Panel de Administración (`apps/admin`)
- **Autenticación:** Better Auth con almacenamiento en Supabase.
- **Gestión de Contenido:** CRUD para Proyectos, Publicaciones, Experiencia en Timeline y Testimonios.
- **Inbox de Consultoría:** Recepción y seguimiento de solicitudes de asesorías y cotizaciones.

---

## 4. Estrategia de Persistencia & Modo Híbrido

1. **Datos Base Tipados (Zero-Config / Instant Load):** El frontend carga datos enriquecidos por defecto desde constantes estáticas en `@pranakaia/domain` o configuración local, asegurando que la web sea 100% funcional inmediatamente tras el clonado sin requerir base de datos inicial.
2. **Sincronización Supabase:** Cuando las credenciales de Supabase están configuradas en `.env.local`, el sistema consulta y combina las actualizaciones y registros creados desde el Panel Admin.

---

## 5. Pruebas y Plan de Verificación

- **Pruebas Unitarias (`vitest`):** Verificación de cálculos en `@pranakaia/domain/metallurgy` con casos de prueba basados en datos reales de plantas concentradoras e hidrometalúrgicas.
- **Pruebas de Integración y Rendimiento:** Verificación de streaming de IA, fallback de proveedores y cálculo de balances de masa.
- **Pruebas E2E (`playwright`):** Comprobación de renderizado interactivo, formularios de cálculo, simulación y envío de consultas.
- **Validación de Calidad y Linting:** `pnpm lint`, `pnpm typecheck`, `pnpm quality:metrics`.
