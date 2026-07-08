-- ============================================================================
-- SCRIPT DE VERIFICACIÓN DE POLÍTICAS RLS
-- Ejecutar en Supabase SQL Editor para verificar que RLS funciona correctamente
-- ============================================================================

-- ==================== SETUP: Crear usuarios de prueba ====================

-- Usuario normal (user@example.com)
-- Usuario admin (admin@pranakaia.com)
-- Estos deben crearse manualmente en Supabase Dashboard → Auth → Users

-- ==================== TEST 1: PRODUCTOS (Público) ====================

-- ✅ DEBE FUNCIONAR: Lectura pública de productos (sin autenticación)
SELECT COUNT(*) as total_productos FROM "Product";
-- Resultado esperado: Número de productos (sin error)

-- ✅ DEBE FUNCIONAR: Admin puede insertar productos
-- Ejecutar como admin@pranakaia.com:
/*
INSERT INTO "Product" (id, name, slug, description, price, category, stock, "createdAt", "updatedAt")
VALUES (
  'test_product_123',
  'Test Product',
  'test-product-slug',
  'This is a test product',
  99.99,
  'test',
  10,
  NOW(),
  NOW()
);
*/

-- ❌ DEBE FALLAR: Usuario normal NO puede insertar productos
-- Ejecutar como user@example.com:
/*
INSERT INTO "Product" (id, name, slug, description, price, category, stock, "createdAt", "updatedAt")
VALUES (
  'test_product_456',
  'Test Product 2',
  'test-product-2',
  'Should fail',
  50.00,
  'test',
  5,
  NOW(),
  NOW()
);
*/
-- Resultado esperado: ERROR: new row violates row-level security policy

-- ==================== TEST 2: ÓRDENES (Solo dueño o admin) ====================

-- ✅ DEBE FUNCIONAR: Usuario ve solo sus propias órdenes
-- Ejecutar como user@example.com:
SELECT COUNT(*) as mis_ordenes FROM "Order"
WHERE "customerId" = get_customer_id();
-- Resultado esperado: Número de órdenes del usuario (puede ser 0)

-- ✅ DEBE FUNCIONAR: Admin ve todas las órdenes
-- Ejecutar como admin@pranakaia.com:
SELECT COUNT(*) as todas_ordenes FROM "Order";
-- Resultado esperado: Todas las órdenes del sistema

-- ❌ DEBE FALLAR: Usuario NO ve órdenes de otros
-- Ejecutar como user@example.com:
SELECT COUNT(*) FROM "Order"
WHERE "customerId" != get_customer_id();
-- Resultado esperado: 0 (sin error, pero no ve las de otros)

-- ==================== TEST 3: REVIEWS (Lectura pública, escritura autenticada) ====================

-- ✅ DEBE FUNCIONAR: Lectura pública de reviews (sin autenticación)
SELECT COUNT(*) as total_reviews FROM "Review";
-- Resultado esperado: Número de reviews

-- ✅ DEBE FUNCIONAR: Usuario autenticado puede crear review
-- Ejecutar como user@example.com:
/*
INSERT INTO "Review" (id, "productId", "customerId", rating, comment, "createdAt", "updatedAt")
VALUES (
  'test_review_123',
  (SELECT id FROM "Product" LIMIT 1),  -- Tomar cualquier producto
  get_customer_id(),
  5,
  'Great product!',
  NOW(),
  NOW()
);
*/

-- ❌ DEBE FALLAR: Usuario anónimo NO puede crear review
-- Ejecutar sin autenticación:
/*
INSERT INTO "Review" (id, "productId", rating, comment, "createdAt", "updatedAt")
VALUES (
  'test_review_456',
  (SELECT id FROM "Product" LIMIT 1),
  4,
  'Should fail',
  NOW(),
  NOW()
);
*/
-- Resultado esperado: ERROR: new row violates row-level security policy

-- ==================== TEST 4: COUPONS (Solo activos públicamente, escritura admin) ====================

-- ✅ DEBE FUNCIONAR: Lectura de cupones activos (sin autenticación)
SELECT COUNT(*) FROM "Coupon"
WHERE active = true
  AND "startsAt" <= NOW()
  AND ("expiresAt" IS NULL OR "expiresAt" >= NOW());
-- Resultado esperado: Número de cupones activos

-- ❌ DEBE FALLAR: Usuario normal NO ve cupones inactivos o expirados
-- Ejecutar como user@example.com:
SELECT COUNT(*) FROM "Coupon" WHERE active = false;
-- Resultado esperado: 0 (RLS bloquea los inactivos para no-admins)

-- ✅ DEBE FUNCIONAR: Admin ve todos los cupones
-- Ejecutar como admin@pranakaia.com:
SELECT COUNT(*) FROM "Coupon";
-- Resultado esperado: Todos los cupones (activos e inactivos)

-- ==================== TEST 5: CART (Solo dueño o admin) ====================

-- ✅ DEBE FUNCIONAR: Usuario ve solo su carrito
-- Ejecutar como user@example.com:
SELECT COUNT(*) FROM "Cart"
WHERE "customerId" = get_customer_id();
-- Resultado esperado: 1 o 0 (su propio carrito)

-- ❌ DEBE FALLAR: Usuario NO ve carritos de otros
-- Ejecutar como user@example.com:
SELECT COUNT(*) FROM "Cart"
WHERE "customerId" != get_customer_id();
-- Resultado esperado: 0

-- ✅ DEBE FUNCIONAR: Admin ve todos los carritos
-- Ejecutar como admin@pranakaia.com:
SELECT COUNT(*) FROM "Cart";
-- Resultado esperado: Todos los carritos

-- ==================== TEST 6: FUNCIONES HELPER ====================

-- Verificar función is_admin()
-- Ejecutar como admin@pranakaia.com:
SELECT is_admin() as soy_admin;
-- Resultado esperado: true

-- Ejecutar como user@example.com:
SELECT is_admin() as soy_admin;
-- Resultado esperado: false

-- Verificar función get_customer_id()
-- Ejecutar como user@example.com (con customer existente):
SELECT get_customer_id() as mi_customer_id;
-- Resultado esperado: ID del customer asociado al email

-- Verificar función has_purchased_product()
-- Ejecutar como user@example.com:
SELECT has_purchased_product('product_id_aqui') as compre_este_producto;
-- Resultado esperado: true/false según si compró el producto

-- ==================== TEST 7: INVENTORY (Lectura pública, escritura admin) ====================

-- ✅ DEBE FUNCIONAR: Lectura pública de inventario (para mostrar stock)
SELECT COUNT(*) FROM "InventoryItem";
-- Resultado esperado: Número de items de inventario

-- ❌ DEBE FALLAR: Usuario normal NO puede modificar inventario
-- Ejecutar como user@example.com:
/*
UPDATE "InventoryItem"
SET quantity = 999
WHERE id = (SELECT id FROM "InventoryItem" LIMIT 1);
*/
-- Resultado esperado: ERROR: new row violates row-level security policy

-- ✅ DEBE FUNCIONAR: Admin puede modificar inventario
-- Ejecutar como admin@pranakaia.com:
/*
UPDATE "InventoryItem"
SET quantity = quantity + 10
WHERE "productId" = (SELECT id FROM "Product" LIMIT 1);
*/

-- ==================== CLEANUP: Eliminar datos de prueba ====================

-- Ejecutar como admin para limpiar:
/*
DELETE FROM "Review" WHERE id LIKE 'test_%';
DELETE FROM "Product" WHERE id LIKE 'test_%';
*/

-- ==================== RESULTADOS ESPERADOS - RESUMEN ====================

/*
┌─────────────────────────────────────┬────────────────┬─────────────────┐
│ Test                                │ Usuario Normal │ Admin           │
├─────────────────────────────────────┼────────────────┼─────────────────┤
│ Ver productos                       │ ✅ SÍ          │ ✅ SÍ           │
│ Crear producto                      │ ❌ NO          │ ✅ SÍ           │
│ Ver sus propias órdenes             │ ✅ SÍ          │ ✅ SÍ           │
│ Ver órdenes de otros                │ ❌ NO          │ ✅ SÍ           │
│ Ver reviews (público)               │ ✅ SÍ          │ ✅ SÍ           │
│ Crear review                        │ ✅ SÍ (auth)   │ ✅ SÍ           │
│ Ver cupones activos                 │ ✅ SÍ          │ ✅ SÍ           │
│ Ver cupones inactivos               │ ❌ NO          │ ✅ SÍ           │
│ Crear cupón                         │ ❌ NO          │ ✅ SÍ           │
│ Ver su carrito                      │ ✅ SÍ          │ ✅ SÍ           │
│ Ver carritos de otros               │ ❌ NO          │ ✅ SÍ           │
│ Ver inventario (stock)              │ ✅ SÍ          │ ✅ SÍ           │
│ Modificar inventario                │ ❌ NO          │ ✅ SÍ           │
│ Ver movimientos de inventario       │ ❌ NO          │ ✅ SÍ           │
└─────────────────────────────────────┴────────────────┴─────────────────┘
*/

-- ============================================================================
-- COMANDOS ÚTILES PARA DEBUGGING
-- ============================================================================

-- Ver todas las políticas RLS activas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Ver qué tablas tienen RLS habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true;

-- Ver el JWT del usuario actual
SELECT auth.jwt();

-- Ver el email del usuario actual
SELECT auth.jwt() ->> 'email' as current_user_email;

-- Ver si el usuario actual es admin
SELECT is_admin() as es_admin, auth.jwt() ->> 'email' as email;

-- Ver customer_id del usuario actual
SELECT get_customer_id() as customer_id, auth.jwt() ->> 'email' as email;
