# Guía de Debugging y Solución de Problemas (Troubleshooting)

Cuando encuentras comportamientos erráticos en Next.js, caídas por OOM (Out of Memory) en Node, o cuellos de botella de red hacia Prisma, este playbook te dará métodologías eficientes que te ahorrarán horas de golpear el teclado.

## 1. Local Development (Next.js React Client/Server Mismatches)

El famoso error de hidratación: `Text content did not match. Server: "A" Client: "B".`

**¿Por qué pasa?**
Usualmente estás usando propiedades asimétricas que difieren por el timestamp local, variables de ventana (window no existe en servidor) u horas.

**Cómo debuggear:**
1. Desactiva temporalmente el framework UI y aísla el payload pelado.
2. Si dependes de la hora actual (`new Date()`), asegúrate de generar esto sólamente tras la primera carga usando un custom hook `useMounted` o similar para de-sincronizar intencionalmente el SSR hasta que se hidrate.

## 2. Server Side Tracing e Inspection con Chrome/VSCode

Si tienes una Server Action congelada o retornando mal:
- Corre el servidor de desarrollo en modo debug (Node.js `--inspect` flag, que Next.js levanta con `NODE_OPTIONS='--inspect' pnpm dev`).
- Abre Google Chrome en `chrome://inspect/#devices`. Haz click en el target de NextJS.
- O, utiliza la característica nativa "Attach to Process" en la pestaña de depuración de VS Code.
Esto te habilitará los Breakpoints línea a línea en un archivo `.ts` del backend simulado de Next, para ver el valor exacto del string que falla.

## 3. Profiling Performance de Prisma (Slow Queries)

Si el Dashboard de Admin o Catálogo cargan lentos:
1. Activa los logs de query de Prisma en el PrismaClient global:
   ```ts
   const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });
   ```
2. Analiza el Output Panel en la terminal o logs en consola web. Verifica los ms de Execution.
3. Si la latencia de Postgres es de 4 segundos para un simple renderizado, copia el comando raw nativo exacto y córrelo en DBeaver anexando un `EXPLAIN ANALYZE` al inicio. Identifica un "Sequential Scan". Agrega indexes en los modelos de Prisma afectados y retoma.

## 4. OOM Logs en Vercel Edge/Serverless Environments

El Serverless te impone límites restrictivos de memoria (Ej: 1024MB RAM Vercel Function memory). Si el endpoint /export/orders cae con Error `502 Vercel Crash Payload too large`.

**Solución Inmediata de Debug:**
1. Lee los Application Logs en la pestaña correspondiente o envía a Datadog.
2. Si ves `Memory usage: 1050MB... Killed`, es que estás cargando todos los registros a memoria del stream de Prisma.
3. Cambia métodos `.findMany()` ciegos por **Generators** o *Batch Processing* iterativo `cursor-based pagination chunk de 100`, parsealos, envíalos y suéltalos en el Heap para el Garbage Collector.

> [!TIP]
> Jamás serializes arrays masivos con `JSON.stringify` de un golpe para mandarlos a clientes o a buckets (S3). Usa Streaming Data (Web Streams API o NodeJS Streams) para devolver los CSV / PDF grandes en E-Commerce sin tocar Memory Caps.
