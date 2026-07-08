# Resources - Bounded Contexts (Screaming Architecture)

Este directorio contiene los **dominios de negocio** (bounded contexts) de la aplicación admin, siguiendo los principios de **Screaming Architecture** donde los nombres de las carpetas revelan la intención del negocio.

## Estructura

Cada recurso sigue este patrón:

`
resources/
+-- [domain]/           # Dominio de negocio (inventory, products, orders, etc.)
¦   +-- actions/        # Server actions (mutaciones)
¦   ¦   +-- index.ts    # Implementación de actions
¦   ¦   +-- types.ts    # Tipos y schemas
¦   +-- queries/        # Queries para Server Components
¦   ¦   +-- index.ts    # Implementación de queries
¦   +-- schemas/        # Validación Zod
¦   ¦   +-- index.ts    # Schemas export
¦   +-- components/     # Componentes UI del dominio
¦   +-- index.ts        # Public API del recurso
+-- _shared/            # Primitivas compartidas
    +-- components/     # Componentes reutilizables
`

## Crear un Nuevo Recurso

1. Crear carpeta: esources/[domain]/
2. Añadir ctions/index.ts para mutaciones
3. Añadir queries/index.ts para RSC data fetching
4. Añadir schemas/index.ts para validación Zod
5. Añadir components/ para UI del dominio
6. Exportar public API desde index.ts

## Ejemplo: Products Resource

### Actions (Mutaciones)

`	ypescript
// resources/products/actions/index.ts
'use server';

import { ProductService } from '@pranakaia/application';
import { adminActionClient } from '@/lib/safe-action';
import { requireAdminPermission } from '@/lib/security/admin-rbac';

export const getProducts = adminActionClient
  .schema(getProductsSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Auth & RBAC handled by middleware
    await requireAdminPermission({
      user: ctx.user,
      resource: 'products',
      action: 'read',
    });
    
    return await ProductService.getProducts(parsedInput);
  });
`

### Queries (RSC)

`	ypescript
// resources/products/queries/index.ts
'use server';

import { ProductService } from '@pranakaia/application';

export async function getProductsQuery(filters) {
  const result = await ProductService.getProducts(filters);
  
  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}
`

### Page (Server Component)

`	ypescript
// app/(dashboard)/products/page.tsx
import { getProductsQuery } from '@/resources/products/queries';

export default async function ProductsPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp.page) || 1,
    search: sp.search,
  };

  const result = await getProductsQuery(filters);

  return <ProductList products={result.products} />;
}
`

## Reglas de Implementación

### 1. Server Actions \"Thin\"

Las actions en esources/[domain]/actions/ SOLO deben:

- Validar autenticación
- Validar permisos RBAC
- Validar input con Zod
- Delegar a @pranakaia/application

`	ypescript
// ? BIEN: Thin wrapper
export const action = adminActionClient
  .schema(schema)
  .action(async ({ parsedInput, ctx }) => {
    // 1. Auth by middleware
    // 2. RBAC
    await requireAdminPermission({ ... });
    // 3. Delegate
    return await ApplicationService.method(parsedInput);
  });

// ? MAL: Lógica de negocio
export const action = adminActionClient.action(async () => {
  const db = connectDB(); // NO directa a DB
  const result = await db.select(); // NO
  return result;
});
`

### 2. Data Provider \"Result-Aware\"

El esult-bridge.ts desenvuelve Result<T, E>:

`	ypescript
// providers/data/result-bridge.ts
export function liftToAdminError<T>(fn: () => Promise<T>): Promise<T> {
  return fn().catch(err => {
    throw new AdminUIError(err.message, err.code);
  });
}
`

### 3. RBAC en Profundidad (Defense in Depth)

`	ypescript
// Nivel 1: Middleware - Bloqueo de rutas
// config/resources.config.ts
export const resources = [{
  name: 'products',
  subject: 'Product',
  minAction: 'read',
}];

// Nivel 2: Action Provider - Validación de metadata
export const action = adminActionClient
  .metadata({ 
    actionName: 'products.get', 
    ability: { action: 'read', subject: 'Product' } 
  })
  .action(async ({ ctx }) => { ... });

// Nivel 3: UI - Componente <Can />
import { Can } from '@/providers/access-control';

<Can I=\"update\" a=\"Product\">
  <EditButton />
</Can>
`

## Recursos Disponibles

### Core
- products - Catálogo de productos
- inventory - Gestión de stock
- orders - Órdenes de venta
- suppliers - Proveedores
- pricing - Precios y márgenes

### Commerce
- customers - Clientes
- cms - Páginas y contenido
- nalytics - Reportes

### Operations
- utomation - Workflows
- monitoring - Health y logs

### System
- dashboard - Vista principal
- settings - Configuración

## Patrones Comunes

### Crear nueva acción

`	ypescript
// resources/products/actions/approveProduct.action.ts
'use server';

import { ProductService } from '@pranakaia/application';
import { adminActionClient } from '@/lib/safe-action';

export const approveProduct = adminActionClient
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    await requireAdminPermission({
      user: ctx.user,
      resource: 'products',
      action: 'approve',
      metadata: { productId: parsedInput.id },
    });
    
    return await ProductService.approve(parsedInput.id);
  });
`

### Crear nuevo query

`	ypescript
// resources/products/queries/getFeaturedProducts.query.ts
'use server';

import { ProductService } from '@pranakaia/application';

export async function getFeaturedProductsQuery() {
  const result = await ProductService.getFeatured();
  
  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}
`

## Beneficios

1. **Screaming Architecture** - Las carpetas revelan intención
2. **Hexagonal** - UI no depende de infraestructura
3. **Testable** - Cada capa testeable aisladamente
4. **Escalable** - Nuevos dominios no afectan existentes
5. **Type-safe** - Validación en cada frontera

## Referencias

- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Screaming Architecture](https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html)
- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [next-safe-action](https://next-safe-action.dev/)
