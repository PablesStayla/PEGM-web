import {
  type DomainError as ActualDomainError,
  AuditService,
  type CurrencyCode,
  ProductIdHelper,
  Result,
} from '@pranakaia/shared-kernel';
import { type IProductRepository, Money, type Product, ProductNotFoundError } from '../index';
import type { UpdateProductDto } from './product-dtos';

/** Repository that supports binding a Drizzle transaction executor. */
export interface RepositoryWithExecutor<T, R> extends IProductRepository {
  withExecutor(executor: T): R;
}

export function isTransactional(
  repo: IProductRepository,
): repo is RepositoryWithExecutor<unknown, IProductRepository> {
  return (
    'withExecutor' in repo &&
    typeof (repo as RepositoryWithExecutor<unknown, IProductRepository>).withExecutor === 'function'
  );
}

export function getRepo(repo: IProductRepository, tx: unknown): IProductRepository {
  return isTransactional(repo) ? repo.withExecutor(tx) : repo;
}

export function ensureMoneyResult(
  val: Money | { amount: number; currency: string },
): Result<Money, ActualDomainError> {
  if (val instanceof Money) {
    return Result.ok(val);
  }
  return Money.create(val.amount, val.currency as unknown as CurrencyCode);
}

export function applyUpdates(
  product: Product,
  updates: UpdateProductDto,
): Result<void, ActualDomainError> {
  const priceRes = applyPriceUpdate(product, updates.price);
  if (!priceRes.success) {
    return priceRes;
  }
  return applyStockUpdate(product, updates.stock);
}

export function applyPriceUpdate(
  product: Product,
  price?: Money | { amount: number; currency: string },
): Result<void, ActualDomainError> {
  if (!price) {
    return Result.ok(undefined);
  }
  const moneyRes = ensureMoneyResult(price);
  if (!moneyRes.success) {
    return Result.err(moneyRes.errorValue);
  }
  return product.changePrice(moneyRes.getValue());
}

export function applyStockUpdate(
  product: Product,
  stock?: number,
): Result<void, ActualDomainError> {
  if (stock === undefined) {
    return Result.ok(undefined);
  }
  return product.updateStock(stock);
}

export async function getRequiredProduct(
  repo: IProductRepository,
  id: string,
): Promise<Result<Product, Error>> {
  const result = await repo.findById(ProductIdHelper.from(id));
  if (!result.success) {
    return Result.err(result.errorValue);
  }
  if (!result.value) {
    return Result.err(new ProductNotFoundError(id));
  }
  return Result.ok(result.value);
}

export async function logAudit(
  action: string,
  entityId: string,
  userId?: string,
  metadata?: Record<string, unknown>,
  correlationId?: string,
  severity: 'info' | 'warning' | 'error' = 'info',
): Promise<void> {
  await AuditService.log({
    action,
    entityType: 'product',
    entityId,
    severity,
    userId,
    metadata,
    correlationId,
  });
}
