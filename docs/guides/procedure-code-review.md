# Checklist Exhaustivo de Code Review

Mantener una base de código robusta y sana a largo plazo exige una revisión implacable por pares (Peer Programming / PR Review). Usa esta lista estandarizada para evaluar el código de E-Commerce, orientada a evitar dolores de cabeza futuros.

> [!IMPORTANT]
> Un PR sin este checklist evaluado conscientemente (aprobación ciega) compromete la responsabilidad del revisor tanto como del desarrollador que subió la PR.

## 1. Diseño y Arquitectura 🧱

- [ ] ¿El archivo modificado está en la capa correcta? (El frontend no debe hacer invocaciones SQL crudas; el servidor de action no debería generar componentes HTML de UI directamente a menos que use RSC apropiadamente).
- [ ] ¿El PR soluciona la premisa original del ticket/issue? ¿Está haciendo más refactores aleatorios de lo necesario ("scope creep")?
- [ ] ¿Se introducen nuevas dependencias externas / npm packages? Si es así, ¿eran estrictamente necesarias o podríamos haber usado librerías nativas / internas para ese diminuto problema de fechas/arrays?

## 2. Pruebas y Seguridad (Testing & Sec) 🔐

- [ ] ¿Agregó Vitest o Playwright cubriendo su flujo o casuística crítica? Si alteró el Checkout, debe probar que los cobros en Stripe simulados o cupones aplican bien.
- [ ] ¿Existen fugas de datos de seguridad? Validar si algún `.env` expone credenciales hardcodeadas (ej. `STRIPE_KEY='sk_live...'`).
- [ ] ¿Los Endpoints Server Actions devueltos verificaron a nivel de base de código el rol del usuario (ACL)? (`if(!session || session.role !== 'ADMIN') throw Error()`).
- [ ] ¿Maneja los `null/undefined/Error/Rejected Promise` elegantemente mediante try/catch o retornos funcionales usando `success: false` pattern o Error Boundaries en UI?

## 3. Data e Infraestructura (Database & ORM) 🗄️

- [ ] Cuidado extremo a las **N+1 Queries** de Prisma ORM. ¿Hizo un `findMany({})` sobre un Array en un bucle map para ir por los subregistros? Obliga a que lo reemplace por usar la cláusula relacional o anidada `include` implícita en Prisma en un único Query.
- [ ] Si este cambio adicionó algo al `schema.prisma`, ¿Revisaron que esté la migración adjunta subida al repositorio para re-sincronizar a los otros locales (Devs)? Y ¿posee Indexes aplicables si la tabla estará masivamente leída?

## 4. Estilos y Estática del Código (Linting, DX, Perf) 💅

- [ ] Las modificaciones siguen las directivas establecidas por pre-commit (Prettier/ESlint). (No hay `any` sueltos, uso correcto de React Hooks Dependencies, sin re-renders evitables).
- [ ] Si metió UI/Tailwind: ¿Creó componentes accesibles? ¿Consideró estados Empty (cuando no hay items) y Errores Lógicos visuales (banners)?
- [ ] Tiempos FCP (First Contentful Paint) / Performance: Altera componentes pesados de gran tamaño (LCP), ¿Dejó `<Image />` pre-descargadas y optimizadas o importó un `<img />` obeso que destruye el Lighthouse del Site?
