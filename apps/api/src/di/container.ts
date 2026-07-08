import 'reflect-metadata';

// Cart
import { AddToCartHandler, DrizzleCartRepository, RemoveFromCartHandler } from '@pranakaia/cart';
// Identity
import {
  Argon2PasswordHasher,
  DrizzleSessionRepository,
  DrizzleUserRepository,
  RedisRateLimiter,
  SignInHandler,
  SignOutHandler,
  SignUpHandler,
} from '@pranakaia/identity';
import { DrizzleProductCatalog } from '@pranakaia/infrastructure';
import { db } from '@pranakaia/infrastructure/db';
// Shared
import { InMemoryEventBus } from '@pranakaia/shared-kernel';
import { Redis } from 'ioredis';
import { container } from 'tsyringe';

export function configureContainer() {
  // Database
  container.registerInstance('Database', db);

  // Redis
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const redis = new Redis(redisUrl);
  container.registerInstance('Redis', redis);

  // Event Bus
  const eventBus = new InMemoryEventBus();
  container.registerInstance('EventBus', eventBus);

  // Repositories
  container.register('UserRepository', { useClass: DrizzleUserRepository });
  container.register('SessionRepository', { useClass: DrizzleSessionRepository });
  container.register('CartRepository', { useClass: DrizzleCartRepository });

  // Adapters
  container.register('ProductCatalog', { useClass: DrizzleProductCatalog });
  container.register('RateLimiter', { useClass: RedisRateLimiter });
  container.register('PasswordHasher', { useClass: Argon2PasswordHasher });

  // Command Handlers (auto-registered by TSyringe)
  // Identity
  container.register('SignInHandler', { useClass: SignInHandler });
  container.register('SignUpHandler', { useClass: SignUpHandler });
  container.register('SignOutHandler', { useClass: SignOutHandler });

  // Cart
  container.register('AddToCartHandler', { useClass: AddToCartHandler });
  container.register('RemoveFromCartHandler', { useClass: RemoveFromCartHandler });

  return container;
}

export { container };
