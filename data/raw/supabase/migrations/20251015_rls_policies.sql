-- ============================================================================
-- MIGRATION: Row Level Security (RLS) Policies
-- Fecha: 2025-10-15
-- Descripción: Habilita RLS y define políticas seguras para todas las tablas
-- ============================================================================

-- ==================== HELPER FUNCTIONS ====================

-- Función para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- MVP: Email whitelisting
  RETURN (
    auth.jwt() ->> 'email' LIKE '%@pranakaia.com' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener customer_id del usuario autenticado
CREATE OR REPLACE FUNCTION get_customer_id()
RETURNS TEXT AS $$
DECLARE
  customer_id_val TEXT;
BEGIN
  SELECT id INTO customer_id_val
  FROM "Customer"
  WHERE email = auth.jwt() ->> 'email'
  LIMIT 1;
  
  RETURN customer_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Función para verificar si usuario compró un producto
CREATE OR REPLACE FUNCTION has_purchased_product(product_id_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  customer_id_val TEXT;
BEGIN
  customer_id_val := get_customer_id();
  
  IF customer_id_val IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM "OrderItem" oi
    INNER JOIN "Order" o ON o.id = oi."orderId"
    WHERE o."customerId" = customer_id_val
      AND oi."productId" = product_id_param
      AND o."paymentStatus" = 'PAID'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==================== PRODUCTS ====================

-- Enable RLS
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductVariant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductCategory" ENABLE ROW LEVEL SECURITY;

-- Product: Lectura pública, escritura solo admin
CREATE POLICY "products_select_public" ON "Product"
  FOR SELECT
  USING (true);

CREATE POLICY "products_insert_admin" ON "Product"
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "products_update_admin" ON "Product"
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "products_delete_admin" ON "Product"
  FOR DELETE
  USING (is_admin());

-- Product Variants: Lectura pública, escritura solo admin
CREATE POLICY "variants_select_public" ON "ProductVariant"
  FOR SELECT
  USING (true);

CREATE POLICY "variants_insert_admin" ON "ProductVariant"
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "variants_update_admin" ON "ProductVariant"
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "variants_delete_admin" ON "ProductVariant"
  FOR DELETE
  USING (is_admin());

-- Categories: Lectura pública, escritura solo admin
CREATE POLICY "categories_select_public" ON "Category"
  FOR SELECT
  USING (true);

CREATE POLICY "categories_insert_admin" ON "Category"
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "categories_update_admin" ON "Category"
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "categories_delete_admin" ON "Category"
  FOR DELETE
  USING (is_admin());

-- ProductCategory: Lectura pública, escritura solo admin
CREATE POLICY "product_categories_select_public" ON "ProductCategory"
  FOR SELECT
  USING (true);

CREATE POLICY "product_categories_insert_admin" ON "ProductCategory"
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "product_categories_delete_admin" ON "ProductCategory"
  FOR DELETE
  USING (is_admin());

-- ==================== CUSTOMERS ====================

ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;

-- Customer: Solo puede ver/modificar su propia info, admin ve todo
CREATE POLICY "customers_select_own_or_admin" ON "Customer"
  FOR SELECT
  USING (
    email = auth.jwt() ->> 'email' OR
    is_admin()
  );

CREATE POLICY "customers_insert_own" ON "Customer"
  FOR INSERT
  WITH CHECK (
    email = auth.jwt() ->> 'email' OR
    is_admin()
  );

CREATE POLICY "customers_update_own_or_admin" ON "Customer"
  FOR UPDATE
  USING (
    email = auth.jwt() ->> 'email' OR
    is_admin()
  );

CREATE POLICY "customers_delete_admin" ON "Customer"
  FOR DELETE
  USING (is_admin());

-- ==================== ORDERS ====================

ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;

-- Orders: Solo dueño o admin pueden ver
CREATE POLICY "orders_select_own_or_admin" ON "Order"
  FOR SELECT
  USING (
    "customerId" = get_customer_id() OR
    is_admin()
  );

CREATE POLICY "orders_insert_own" ON "Order"
  FOR INSERT
  WITH CHECK (
    "customerId" = get_customer_id() OR
    is_admin()
  );

-- Solo admin puede actualizar órdenes (cambiar estado)
CREATE POLICY "orders_update_admin" ON "Order"
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "orders_delete_admin" ON "Order"
  FOR DELETE
  USING (is_admin());

-- Order Items: Solo visible para dueño de la orden o admin
CREATE POLICY "order_items_select_own_or_admin" ON "OrderItem"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Order"
      WHERE "Order".id = "OrderItem"."orderId"
        AND ("Order"."customerId" = get_customer_id() OR is_admin())
    )
  );

CREATE POLICY "order_items_insert_own_order" ON "OrderItem"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Order"
      WHERE "Order".id = "OrderItem"."orderId"
        AND ("Order"."customerId" = get_customer_id() OR is_admin())
    )
  );

CREATE POLICY "order_items_delete_admin" ON "OrderItem"
  FOR DELETE
  USING (is_admin());

-- ==================== CART ====================

ALTER TABLE "Cart" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CartItem" ENABLE ROW LEVEL SECURITY;

-- Cart: Solo dueño o admin
CREATE POLICY "cart_select_own_or_admin" ON "Cart"
  FOR SELECT
  USING (
    "customerId" = get_customer_id() OR
    is_admin()
  );

CREATE POLICY "cart_insert_own" ON "Cart"
  FOR INSERT
  WITH CHECK (
    "customerId" = get_customer_id() OR
    is_admin()
  );

CREATE POLICY "cart_update_own_or_admin" ON "Cart"
  FOR UPDATE
  USING (
    "customerId" = get_customer_id() OR
    is_admin()
  );

CREATE POLICY "cart_delete_own_or_admin" ON "Cart"
  FOR DELETE
  USING (
    "customerId" = get_customer_id() OR
    is_admin()
  );

-- Cart Items: Solo dueño del carrito o admin
CREATE POLICY "cart_items_select_own_or_admin" ON "CartItem"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Cart"
      WHERE "Cart".id = "CartItem"."cartId"
        AND ("Cart"."customerId" = get_customer_id() OR is_admin())
    )
  );

CREATE POLICY "cart_items_insert_own_cart" ON "CartItem"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Cart"
      WHERE "Cart".id = "CartItem"."cartId"
        AND ("Cart"."customerId" = get_customer_id() OR is_admin())
    )
  );

CREATE POLICY "cart_items_update_own_or_admin" ON "CartItem"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Cart"
      WHERE "Cart".id = "CartItem"."cartId"
        AND ("Cart"."customerId" = get_customer_id() OR is_admin())
    )
  );

CREATE POLICY "cart_items_delete_own_or_admin" ON "CartItem"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "Cart"
      WHERE "Cart".id = "CartItem"."cartId"
        AND ("Cart"."customerId" = get_customer_id() OR is_admin())
    )
  );

-- ==================== REVIEWS ====================

ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;

-- Reviews: Lectura pública
CREATE POLICY "reviews_select_public" ON "Review"
  FOR SELECT
  USING (true);

-- Creación solo autenticado (opcional: que haya comprado el producto)
CREATE POLICY "reviews_insert_authenticated" ON "Review"
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    -- Descomentar para requerir compra previa:
    -- AND has_purchased_product("productId")
  );

-- Solo puede modificar sus propias reviews o admin
CREATE POLICY "reviews_update_own_or_admin" ON "Review"
  FOR UPDATE
  USING (
    "customerId" = get_customer_id() OR
    is_admin()
  );

CREATE POLICY "reviews_delete_own_or_admin" ON "Review"
  FOR DELETE
  USING (
    "customerId" = get_customer_id() OR
    is_admin()
  );

-- ==================== WISHLIST ====================

ALTER TABLE "Wishlist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WishlistItem" ENABLE ROW LEVEL SECURITY;

-- Wishlist: Solo dueño o admin
CREATE POLICY "wishlist_select_own_or_admin" ON "Wishlist"
  FOR SELECT
  USING (
    "customerId" = get_customer_id() OR
    is_admin()
  );

CREATE POLICY "wishlist_insert_own" ON "Wishlist"
  FOR INSERT
  WITH CHECK (
    "customerId" = get_customer_id() OR
    is_admin()
  );

CREATE POLICY "wishlist_delete_own_or_admin" ON "Wishlist"
  FOR DELETE
  USING (
    "customerId" = get_customer_id() OR
    is_admin()
  );

-- Wishlist Items: Solo dueño de la wishlist o admin
CREATE POLICY "wishlist_items_select_own_or_admin" ON "WishlistItem"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Wishlist"
      WHERE "Wishlist".id = "WishlistItem"."wishlistId"
        AND ("Wishlist"."customerId" = get_customer_id() OR is_admin())
    )
  );

CREATE POLICY "wishlist_items_insert_own" ON "WishlistItem"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Wishlist"
      WHERE "Wishlist".id = "WishlistItem"."wishlistId"
        AND ("Wishlist"."customerId" = get_customer_id() OR is_admin())
    )
  );

CREATE POLICY "wishlist_items_delete_own_or_admin" ON "WishlistItem"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "Wishlist"
      WHERE "Wishlist".id = "WishlistItem"."wishlistId"
        AND ("Wishlist"."customerId" = get_customer_id() OR is_admin())
    )
  );

-- ==================== COUPONS ====================

ALTER TABLE "Coupon" ENABLE ROW LEVEL SECURITY;

-- Coupons: Lectura solo si está activo y vigente (público), escritura solo admin
CREATE POLICY "coupons_select_active_or_admin" ON "Coupon"
  FOR SELECT
  USING (
    (
      active = true AND
      "startsAt" <= NOW() AND
      ("expiresAt" IS NULL OR "expiresAt" >= NOW())
    ) OR
    is_admin()
  );

CREATE POLICY "coupons_insert_admin" ON "Coupon"
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "coupons_update_admin" ON "Coupon"
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "coupons_delete_admin" ON "Coupon"
  FOR DELETE
  USING (is_admin());

-- ==================== SHIPPING ====================

ALTER TABLE "ShippingZone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShippingRate" ENABLE ROW LEVEL SECURITY;

-- Shipping: Lectura pública de zonas/tarifas activas, escritura solo admin
CREATE POLICY "shipping_zones_select_active" ON "ShippingZone"
  FOR SELECT
  USING (active = true OR is_admin());

CREATE POLICY "shipping_zones_insert_admin" ON "ShippingZone"
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "shipping_zones_update_admin" ON "ShippingZone"
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "shipping_zones_delete_admin" ON "ShippingZone"
  FOR DELETE
  USING (is_admin());

CREATE POLICY "shipping_rates_select_active" ON "ShippingRate"
  FOR SELECT
  USING (active = true OR is_admin());

CREATE POLICY "shipping_rates_insert_admin" ON "ShippingRate"
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "shipping_rates_update_admin" ON "ShippingRate"
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "shipping_rates_delete_admin" ON "ShippingRate"
  FOR DELETE
  USING (is_admin());

-- ==================== INVENTORY ====================

ALTER TABLE "InventoryItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InventoryMovement" ENABLE ROW LEVEL SECURITY;

-- Inventory: Lectura pública (para ver stock), escritura solo admin
CREATE POLICY "inventory_items_select_public" ON "InventoryItem"
  FOR SELECT
  USING (true);

CREATE POLICY "inventory_items_insert_admin" ON "InventoryItem"
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "inventory_items_update_admin" ON "InventoryItem"
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "inventory_items_delete_admin" ON "InventoryItem"
  FOR DELETE
  USING (is_admin());

-- Inventory Movements: Solo admin puede ver y modificar
CREATE POLICY "inventory_movements_select_admin" ON "InventoryMovement"
  FOR SELECT
  USING (is_admin());

CREATE POLICY "inventory_movements_insert_admin" ON "InventoryMovement"
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "inventory_movements_delete_admin" ON "InventoryMovement"
  FOR DELETE
  USING (is_admin());

-- ==================== NEWSLETTER ====================

ALTER TABLE "Newsletter" ENABLE ROW LEVEL SECURITY;

-- Newsletter: Solo admin puede ver, cualquiera puede suscribirse
CREATE POLICY "newsletter_select_admin" ON "Newsletter"
  FOR SELECT
  USING (is_admin());

CREATE POLICY "newsletter_insert_public" ON "Newsletter"
  FOR INSERT
  WITH CHECK (true);

-- Solo admin puede actualizar/eliminar
CREATE POLICY "newsletter_update_admin" ON "Newsletter"
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "newsletter_delete_admin" ON "Newsletter"
  FOR DELETE
  USING (is_admin());

-- ==================== ADMIN USERS ====================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Users (admin): Solo admin puede ver/modificar
CREATE POLICY "users_select_admin" ON "User"
  FOR SELECT
  USING (is_admin());

CREATE POLICY "users_insert_admin" ON "User"
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "users_update_admin" ON "User"
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "users_delete_admin" ON "User"
  FOR DELETE
  USING (is_admin());

-- ==================== PERFORMANCE INDEXES ====================

-- Índices para búsqueda y performance
CREATE INDEX IF NOT EXISTS idx_product_slug ON "Product"(slug);
CREATE INDEX IF NOT EXISTS idx_product_category ON "Product"(category);
CREATE INDEX IF NOT EXISTS idx_product_featured ON "Product"(featured);
CREATE INDEX IF NOT EXISTS idx_product_created_at ON "Product"("createdAt" DESC);

-- Índice para búsqueda full-text (FTS) - Para implementación futura
-- CREATE INDEX idx_product_fts ON "Product" 
--   USING gin(to_tsvector('spanish', name || ' ' || description));

-- Índices para variants
CREATE INDEX IF NOT EXISTS idx_variant_sku ON "ProductVariant"(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_variant_product_id ON "ProductVariant"("productId");

-- Índices para orders (performance de admin panel)
CREATE INDEX IF NOT EXISTS idx_order_status ON "Order"(status);
CREATE INDEX IF NOT EXISTS idx_order_payment_status ON "Order"("paymentStatus");
CREATE INDEX IF NOT EXISTS idx_order_created_at ON "Order"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_order_customer_id ON "Order"("customerId");

-- Índices para reviews
CREATE INDEX IF NOT EXISTS idx_review_product_id ON "Review"("productId");
CREATE INDEX IF NOT EXISTS idx_review_rating ON "Review"(rating);
CREATE INDEX IF NOT EXISTS idx_review_created_at ON "Review"("createdAt" DESC);

-- Índices para cupones
CREATE INDEX IF NOT EXISTS idx_coupon_code ON "Coupon"(code);
CREATE INDEX IF NOT EXISTS idx_coupon_active_dates ON "Coupon"(active, "startsAt", "expiresAt");

-- ==================== GRANT PERMISSIONS ====================

-- Grant usage en funciones helper
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_customer_id() TO authenticated;
GRANT EXECUTE ON FUNCTION has_purchased_product(TEXT) TO authenticated;

-- ==================== COMMENTS ====================

COMMENT ON FUNCTION is_admin() IS 'Verifica si el usuario actual es admin (email @pranakaia.com o metadata.role=admin)';
COMMENT ON FUNCTION get_customer_id() IS 'Retorna el customer_id del usuario autenticado basado en email';
COMMENT ON FUNCTION has_purchased_product(TEXT) IS 'Verifica si el usuario compró un producto específico (para reviews verificadas)';

-- ============================================================================
-- FIN DE MIGRACIÓN RLS
-- ============================================================================
