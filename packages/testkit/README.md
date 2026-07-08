# @pranakaia/testkit

Testing utilities, mocks, factories and helpers for PranaKaia E-Commerce.

## 📦 Installation

```bash
pnpm add -D @pranakaia/testkit
```

## 🚀 Quick Start

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  createMockUser,
  createMockProduct,
  getPrismaClient,
  cleanDatabase
} from '@pranakaia/testkit';

describe('User Service', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should create a user', async () => {
    const mockUser = createMockUser({ email: 'test@example.com' });
    const prisma = getPrismaClient();

    const user = await prisma.user.create({ data: mockUser });

    expect(user.email).toBe('test@example.com');
  });
});
```

## 📚 Factories

### User Factory

```typescript
import { createMockUser, createAdminUser, createSupplierUser } from '@pranakaia/testkit';

// Basic user
const user = createMockUser();

// User with specific properties
const customUser = createMockUser({
  email: 'john@example.com',
  name: 'John Doe',
  role: 'admin'
});

// Admin user
const admin = createAdminUser();

// Supplier user
const supplier = createSupplierUser();

// Multiple users
const users = createMockUsers(10);
```

### Product Factory

```typescript
import { createMockProduct, createSeedProduct, createLightProduct } from '@pranakaia/testkit';

// Basic product
const product = createMockProduct();

// Seed product
const seed = createSeedProduct({ name: 'Northern Lights Auto' });

// Grow light
const light = createLightProduct({ price: 29999 });

// Dropship product
const dropshipProduct = createDropshipProduct({ supplierId: 'supplier-123' });

// Multiple products
const products = createMockProducts(50);
```

### Order Factory

```typescript
import { createMockOrder, createMockOrderWithItems } from '@pranakaia/testkit';

// Basic order
const order = createMockOrder({ userId: 'user-123' });

// Order with items
const { order, items } = createMockOrderWithItems({ itemsCount: 5 });

// Dropship order
const dropshipOrder = createMockDropshipOrder();
```

## 🛠️ Helpers

### Database Helper

```typescript
import {
  getPrismaClient,
  cleanDatabase,
  resetDatabase,
  seedTestDatabase,
  disconnectDatabase
} from '@pranakaia/testkit';

// Get Prisma client
const prisma = getPrismaClient();

// Clean all data (truncate tables)
await cleanDatabase();

// Reset database (migrations)
await resetDatabase();

// Seed test data
await seedTestDatabase();

// Disconnect
await disconnectDatabase();
```

### Auth Helper

```typescript
import {
  generateMockToken,
  generateTokenFromUser,
  createAuthHeaders,
  generateMockSession
} from '@pranakaia/testkit';

// Generate JWT token
const token = generateMockToken({
  userId: 'user-123',
  email: 'test@example.com',
  role: 'admin',
  tenantId: 'tenant-123'
});

// Generate token from user
const user = createMockUser();
const userToken = generateTokenFromUser(user);

// Create auth headers for API requests
const headers = createAuthHeaders(token);

// Generate NextAuth session
const session = generateMockSession(user);
```

## 🎭 MSW (Mock Service Worker)

### Setup

```typescript
import { server } from '@pranakaia/testkit';
import { beforeAll, afterAll, afterEach } from 'vitest';

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());
```

### Available Endpoints

The testkit includes pre-configured handlers for:

- **Auth**: `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`
- **Products**: `/api/products`, `/api/products/:id`
- **Cart**: `/api/cart/add`
- **Orders**: `/api/orders`
- **Dropshipping**: `/api/dropship/sync`, `/api/dropship/suppliers`
- **Payments**: `/api/payments/create-intent`
- **Search**: `/indexes/products/search`

### Custom Handlers

```typescript
import { http, HttpResponse } from 'msw';
import { server } from '@pranakaia/testkit';

test('custom endpoint', async () => {
  server.use(
    http.get('/api/custom', () => {
      return HttpResponse.json({ data: 'custom response' });
    })
  );

  // Your test here
});
```

## 📝 Example Tests

### Unit Test

```typescript
import { describe, it, expect } from 'vitest';
import { createMockProduct } from '@pranakaia/testkit';
import { calculateDiscount } from './price.utils';

describe('calculateDiscount', () => {
  it('should calculate 10% discount correctly', () => {
    const product = createMockProduct({ price: 10000 });
    const discounted = calculateDiscount(product, 10);

    expect(discounted).toBe(9000);
  });
});
```

### Integration Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPrismaClient,
  cleanDatabase,
  createMockUser,
  createMockProduct
} from '@pranakaia/testkit';

describe('Order Service Integration', () => {
  const prisma = getPrismaClient();

  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should create order with items', async () => {
    const user = await prisma.user.create({ data: createMockUser() });
    const product = await prisma.product.create({ data: createMockProduct() });

    const order = await createOrder({
      userId: user.id,
      items: [{ productId: product.id, quantity: 2 }]
    });

    expect(order.items).toHaveLength(1);
    expect(order.total).toBeGreaterThan(0);
  });
});
```

### E2E Test with MSW

```typescript
import { test, expect } from '@playwright/test';
import { server, createMockUser } from '@pranakaia/testkit';

test.beforeEach(() => {
  server.listen();
});

test.afterEach(() => {
  server.resetHandlers();
});

test.afterAll(() => {
  server.close();
});

test('user can login', async ({ page }) => {
  await page.goto('http://localhost:3000/login');

  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:3000/dashboard');
});
```

## 🔧 Configuration

### Vitest Setup

Add to your `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts'],
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.spec.ts', '**/*.test.ts', '**/node_modules/**']
    }
  }
});
```

### Setup File

Create `vitest.setup.ts`:

```typescript
import '@pranakaia/testkit/setup';
```

## 📄 License

Copyright © 2024 PranaKaia
