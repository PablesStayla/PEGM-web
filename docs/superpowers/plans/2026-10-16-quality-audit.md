# Auditoría de Calidad de Producto — PEGM-web

**Fecha:** 2026-10-16
**Estado:** Borrador para revisión
**Método:** Revisión de código fuente + pruebas E2E existentes + inspección manual de componentes

## 1. Accesibilidad (WCAG 2.1)

### Hallazgos

| Problema | Severidad | Ubicación | Estado | Corrección |
| --- | --- | --- | --- | --- |
| Falta `lang` en `<html>` raíz | Alta | `src/app/layout.tsx` (inexistente) | ✅ Corregido | Commit `0e224fe` añade `<html lang="es-CL">` |
| Enlaces sin texto descriptivo | Media | Revisar componentes | Pendiente | Revisar enlaces "Leer más" |
| Imágenes sin alt | Media | Revisar componentes de imagen | Pendiente | Verificar `alt` en todas las `` |
| Contraste de colores | Baja | Revisar paleta de colores | Pendiente | Verificar con herramienta de contraste |
| Navegación por teclado | Baja | Revisar componentes interactivos | Pendiente | Verificar orden de tab |

### Detalle

**`src/app/layout.tsx`** (nuevo):
- Añade `<html lang="es-CL">` — resuelve WCAG 3.1.1 (Idioma de la página)
- Añade metadatos de título con template — mejora SEO y accesibilidad

**`src/components/site-header.tsx`:**
- Tiene `aria-label` en botones de tema y búsqueda ✅
- Tiene `hrefLang` en enlace de idioma ✅
- Los enlaces de navegación tienen texto descriptivo ✅

**`src/components/site-footer.tsx`:**
- Enlaces con texto descriptivo (Correo, LinkedIn, GitHub, Laboratorio, Admin) ✅
- Enlaces externos con `target="_blank" rel="noopener noreferrer"` ✅

## 2. Rendimiento y Core Web Vitals

### Hallazgos

| Métrica | Estado | Notas |
| --- | --- | --- |
| LCP (Largest Contentful Paint) | Pendiente | No medido aún |
| CLS (Cumulative Layout Shift) | Pendiente | No medido aún |
| INP (Interaction to Next Paint) | Pendiente | No medido aún |
| Imagen OG con `next/og` | ✅ | Optimizada, satori, fuente embebida |
| `revalidate` en páginas públicas | ✅ | 120s para páginas estáticas |
| `revalidate` en OG image | ✅ | 3600s (1 hora) |

### Observaciones

- Las páginas públicas usan `revalidate = 120` (ISR cada 2 minutos) — adecuado para contenido que cambia poco
- La imagen OG usa `revalidate = 3600` (1 hora) — adecuado para contenido que cambia raramente
- La fuente Fraunces va embebida en base64 en `src/app/og-font.ts` — evita solicitud externa de fuente

## 3. SEO y Metadatos

### Hallazgos

| Página | `title` | `description` | `canonical` | `alternates` |
| --- | --- | --- | --- | --- |
| Portada (`/`) | ✅ Template desde layout | ✅ Desde `site.title` | ✅ | ✅ (es-CL/en) |
| CV (`/cv`) | ✅ "CV" | ✅ Descripción completa | ✅ | ✅ |
| Proyectos (`/proyectos`) | ✅ "Proyectos" | ✅ Descripción completa | ✅ | ✅ |
| Laboratorio (`/laboratorio`) | ✅ "Laboratorio" | ✅ Descripción completa | ✅ | ✅ |

### Observaciones

- Todas las páginas públicas tienen `metadata` con `title` y `alternates` para idiomas
- `src/lib/site.ts` proporciona `SITE_URL` para sitemap, canonical, JSON-LD y OG
- `src/app/opengraph-image.tsx` genera imagen OG dinámica desde `getSettings()`
- `src/app/opengraph-image.tsx` usa `revalidate = 3600` (ISR cada hora)
- `src/app/robots.ts` y `src/app/sitemap.ts` deberían existir para SEO completo (verificar)

## 4. Responsive Design

### Hallazgos

| Componente | Estado | Notas |
| --- | --- | --- |
| `SiteHeader` | ✅ | Usa `md:` breakpoints, menú móvil vía command palette |
| `SiteFooter` | ✅ | Usa `sm:flex-row` para adaptarse |
| Páginas públicas | ✅ | Usan `max-w-5xl` con `px-6` y `md:py-28` |
| Laboratorio | ✅ | Usa `max-w-5xl` con `px-6` y `md:py-28` |

### Observaciones

- El menú móvil usa la CommandPalette (Cmd+K) en lugar de hamburguesa tradicional
- Los componentes usan clases Tailwind responsivas (`md:`, `sm:`)

## 5. Errores de Ejecución

### Hallazgos

| Componente | Estado | Notas |
| --- | --- | --- |
| `src/lib/auth.ts` | ✅ | Fallo ruidoso si falta `AUTH_SECRET` en producción |
| `src/lib/actions/auth.ts` | ✅ | Maneja errores de BD con try/catch |
| `src/lib/actions/messages.ts` | ✅ | Maneja errores de inserción con try/catch |
| `src/lib/actions/content.ts` | ✅ | Validación Zod en todas las acciones |
| `src/lib/rate-limit.ts` | ✅ | Rate limiting en contact form y login |

### Observaciones

- `src/lib/auth.ts` lanza error si `AUTH_SECRET` falta en producción (fail-fast)
- `src/lib/actions/auth.ts` maneja errores de BD con `try/catch` y retorna mensaje al usuario
- `src/lib/actions/messages.ts` usa honeypot anti-bots y rate limiting
- `src/lib/actions/content.ts` valida todas las entradas con Zod (revisado en Fase 3)

## 6. Flujos Críticos de Administración

### Hallazgos

| Flujo | Estado | Notas |
| --- | --- | --- |
| Login | ✅ | Pruebas E2E cubren login válido e inválido |
| Cambio de contraseña | ✅ | Validación Zod, mínimo 8 caracteres |
| CRUD proyectos | ✅ | Pruebas E2E cubren crear/editar/eliminar |
| CRUD mensajes | ✅ | Pruebas E2E cubren crear/marcar como leído |
| Semilla de admin | ✅ | Fail-fast si faltan credenciales en producción |

## 7. Robustez de Formularios y Laboratorio

### Hallazgos

| Componente | Estado | Notas |
| --- | --- | --- |
| Formulario de contacto | ✅ | Zod validation, honeypot, rate limiting |
| Formularios de admin | ✅ | Zod validation en todas las Server Actions |
| Laboratorio (flotación) | ✅ | Pruebas E2E cubren interacción con slider |
| Laboratorio (balance de masa) | ✅ | Pruebas E2E cubren entrada válida/inválida |
| Laboratorio (Pourbaix) | ✅ | Pruebas E2E cubren visualización SVG |
| Laboratorio (planta en vivo) | ✅ | Pruebas E2E cubren pausa/reanuda |

## 8. Correcciones Aplicadas en Fase 4

| Corrección | Archivo | Impacto |
| --- | --- | --- |
| `lang="es-CL"` en `<html>` | `src/app/layout.tsx` (nuevo) | WCAG 3.1.1, SEO |
| Metadatos de título con template | `src/app/layout.tsx` (nuevo) | SEO, accesibilidad |
| Validación Zod en Server Actions | `src/lib/actions/content.ts` | Seguridad, integridad de datos |
| Esquemas Zod por entidad | `src/lib/validation.ts` | Reutilización, consistencia |

## 9. Recomendaciones Pendientes

| Recomendación | Prioridad | Notas |
| --- | --- | --- |
| Añadir pruebas de accesibilidad automatizadas (axe-core) | Media | Requiere nueva dependencia |
| Verificar contraste de colores con herramienta automática | Baja | Revisión visual manual suficiente por ahora |
| Añadir `aria-label` a iconos sin texto | Baja | Revisar componentes de iconos |
| Añadir `skip to content` link visible | Baja | Ya existe `<a href="#contenido">` pero podría ser más visible |
| Medir Core Web Vitals en producción | Media | Requiere despliegue y herramienta de monitoreo |
