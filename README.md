# Pablo — Ingeniero Civil Metalúrgico · Sitio personal

Sitio web personal y portafolio de **Pablo**, Ingeniero Civil Metalúrgico (Concepción, Chile).
Diseño minimalista en tonos papel/tinta con acento cobre y tipografía serif elegante.

## Stack

- **[Next.js 15](https://nextjs.org)** (App Router) + **React 19**
- **TypeScript** en modo estricto
- **Tailwind CSS 4**
- Fuentes: **Fraunces** (títulos) e **Inter** (cuerpo), vía `next/font`

## Estructura

```
├── src/
│   ├── app/                  # Rutas (App Router)
│   │   ├── page.tsx          # Inicio: hero, quién soy, especialidades, destacados, contacto
│   │   ├── cv/page.tsx       # CV: experiencia, educación, certificaciones, habilidades
│   │   ├── proyectos/page.tsx# Portafolio completo
│   │   ├── layout.tsx        # Layout raíz (fuentes, header, footer, metadata)
│   │   └── globals.css       # Tema Tailwind (colores y tipografías)
│   ├── components/           # Header, footer, tarjetas, timeline, etc.
│   └── lib/
│       └── content.ts        # ⭐ TODO el contenido editable del sitio
└── public/                   # Archivos estáticos
```

## ✏️ Cómo editar el contenido

**Todo el contenido vive en `src/lib/content.ts`**: nombre, titular, experiencia,
educación, certificaciones, habilidades, proyectos y datos de contacto.
No hace falta tocar componentes para actualizar el sitio.

> Los textos actuales son **ejemplos realistas de relleno** (empresa, universidad,
> correo, LinkedIn y logros). Reemplázalos por tu información real.

Para cambiar colores o tipografías, edita el bloque `@theme` en `src/app/globals.css`.

## Desarrollo

```bash
npm install
npm run dev        # → http://localhost:3000
npm run build      # build de producción
npm run type-check # verificación de tipos
```

## Despliegue

El despliegue más simple es [Vercel](https://vercel.com): importa el repositorio
y funciona sin configuración adicional.

## CI

`.github/workflows/ci.yml` ejecuta `npm run build` en cada push y pull request.
