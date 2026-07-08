# Migration Guide - Legacy Actions to Resources

## Completed Migrations

### Products Domain
- [x] getAdminProducts -> resources/products/actions
- [x] createProduct -> resources/products/actions
- [x] updateProduct -> resources/products/actions
- [x] deleteProduct -> resources/products/actions
- [x] toggleProductActive -> resources/products/actions
- [x] updateProductStock -> resources/products/actions

### Inventory Domain
- [x] getInventoryStats -> resources/inventory/actions
- [x] getLowStockProducts -> resources/inventory/actions
- [x] updateStock -> resources/inventory/actions

### Orders Domain
- [x] getAdminOrders -> resources/orders/actions
- [x] getOrderById -> resources/orders/actions
- [x] updateOrderStatus -> resources/orders/actions
- [x] exportOrdersCsv -> resources/orders/actions

### Suppliers Domain
- [x] getSuppliers -> resources/suppliers/actions
- [x] createSupplier -> resources/suppliers/actions
- [x] updateSupplier -> resources/suppliers/actions

### Pricing Domain
- [x] getPricingData -> resources/pricing/actions
- [x] updatePricing -> resources/pricing/actions
- [x] calculateMargin -> resources/pricing/actions

## Pending Migrations

The following legacy files in src/actions/ need to be migrated:

### High Priority
- [ ] actions/admin-orders.ts -> resources/orders/
- [ ] actions/inventory.ts -> resources/inventory/
- [ ] actions/supplier-actions.ts -> resources/suppliers/
- [ ] actions/cms-pages.ts -> resources/cms/
- [ ] actions/settings.ts -> resources/settings/

### Medium Priority
- [ ] actions/dropship-orders.ts -> resources/dropship/
- [ ] actions/products/*.ts -> resources/products/actions/ (complete)
- [ ] actions/orders/*.ts -> resources/orders/actions/ (complete)

### Low Priority (Legacy/Deprecated)
- [ ] actions/security.ts -> resources/security/
- [ ] actions/margin/*.ts -> resources/pricing/

## Migration Steps per File

1. **Create resource structure**
   `ash
   mkdir -p resources/[domain]/{actions,queries,schemas,components}
   `

2. **Create actions/index.ts**
   - Import from @pranakaia/application
   - Add RBAC with requireAdminPermission
   - Validate with Zod schemas

3. **Create queries/index.ts**
   - For RSC data fetching
   - Return typed data

4. **Create schemas/index.ts**
   - Export Zod schemas

5. **Update imports in pages**
   `	ypescript
   // Before
   import { getProducts } from '@/actions/admin-products';
   
   // After
   import { getProducts } from '@/resources/products/queries';
   `

6. **Test and verify**
   - Run type-check
   - Run tests
   - Manual testing

## Legacy File Status

| File | Status | New Location |
|------|--------|--------------|
| admin-products.ts | ? Migrated | resources/products/ |
| admin-orders.ts | ? Pending | resources/orders/ |
| inventory.ts | ? Pending | resources/inventory/ |
| supplier-actions.ts | ? Pending | resources/suppliers/ |
| cms-pages.ts | ? Pending | resources/cms/ |
| settings.ts | ? Pending | resources/settings/ |
| dropship-orders.ts | ? Pending | resources/dropship/ |
| security.ts | ? Pending | resources/security/ |

## Testing After Migration

`ash
# Type check
pnpm type-check --filter=@pranakaia/admin

# Unit tests
pnpm test --filter=@pranakaia/admin

# E2E tests
pnpm test:e2e:admin
