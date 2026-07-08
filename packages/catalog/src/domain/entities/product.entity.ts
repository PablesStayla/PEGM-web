import { type DomainError, Result } from '@pranakaia/shared-kernel';
import { ProductCreated } from '../events/product.events';
import type { Money } from '../value-objects/money.vo';
import { applyArchive, applyPriceChange, applyPublish, applyStockUpdate } from './product.commands';
import { ProductState } from './product.state';
import { InvalidProductDescriptionError, InvalidProductNameError } from './product-errors';
import type { CreateProductProps } from './product-types';

/**
 * Root Aggregate of Catalog bounded context.
 *
 * Implements business rules for products, category management, price changes,
 * and status transitions.
 */
export class Product extends ProductState {
  private constructor(props: CreateProductProps) {
    super(props);
  }

  /**
   * Factory method to create a new Product. Validates name and description constraints.
   */
  static create(props: CreateProductProps): Result<Product, DomainError> {
    const nameValidation = Product.validateName(props.name);
    if (!nameValidation.success) {
      return Result.err(nameValidation.errorValue);
    }

    const descriptionValidation = Product.validateDescription(props.description);
    if (!descriptionValidation.success) {
      return Result.err(descriptionValidation.errorValue);
    }

    const product = new Product(props);
    product._domainEvents.push(
      new ProductCreated(product.idValue, product._sku.value, product._name, product._price.amount),
    );

    return Result.ok(product);
  }

  /**
   * Reconstitutes a product aggregate from persistence without firing domain events.
   */
  static reconstitute(props: CreateProductProps): Product {
    const product = new Product(props);
    product.clearEvents();
    return product;
  }

  private static validateName(name: string): Result<void, DomainError> {
    if (name.trim().length < 2) {
      return Result.err(new InvalidProductNameError(name));
    }
    return Result.ok(undefined);
  }

  private static validateDescription(description: string): Result<void, DomainError> {
    if (description.trim().length < 10) {
      return Result.err(new InvalidProductDescriptionError(description));
    }
    return Result.ok(undefined);
  }

  /**
   * Modifies the price under active/sellable rules via `applyPriceChange` command.
   */
  changePrice(newPrice: Money): Result<void, DomainError> {
    const res = applyPriceChange(
      {
        idValue: this.idValue,
        price: this._price,
        stockQuantity: this._stockQuantity,
        status: this._status,
      },
      newPrice,
    );
    if (!res.success) {
      return Result.err(res.errorValue);
    }
    const { updates, events } = res.getValue();
    if (updates.price) {
      this._price = updates.price;
    }
    this._domainEvents.push(...events);
    return Result.ok(undefined);
  }

  /**
   * Performs a stock mutation, triggering availability changes under inventory status machine.
   */
  updateStock(quantity: number): Result<void, DomainError> {
    const res = applyStockUpdate(
      {
        idValue: this.idValue,
        price: this._price,
        stockQuantity: this._stockQuantity,
        status: this._status,
      },
      quantity,
    );
    if (!res.success) {
      return Result.err(res.errorValue);
    }
    const { updates, events } = res.getValue();
    if (updates.stockQuantity !== undefined) {
      this._stockQuantity = updates.stockQuantity;
    }
    if (updates.status) {
      this._status = updates.status;
    }
    this._domainEvents.push(...events);
    return Result.ok(undefined);
  }

  /**
   * Publishes the product, transitioning its status to active.
   */
  publish(): Result<void, DomainError> {
    const res = applyPublish({
      idValue: this.idValue,
      price: this._price,
      stockQuantity: this._stockQuantity,
      status: this._status,
    });
    if (!res.success) {
      return Result.err(res.errorValue);
    }
    const { updates, events } = res.getValue();
    if (updates.status) {
      this._status = updates.status;
    }
    this._domainEvents.push(...events);
    return Result.ok(undefined);
  }

  /**
   * Archives the product, frozen for customer search but kept for historical integrity.
   */
  archive(): Result<void, DomainError> {
    const res = applyArchive({
      idValue: this.idValue,
      price: this._price,
      stockQuantity: this._stockQuantity,
      status: this._status,
    });
    if (!res.success) {
      return Result.err(res.errorValue);
    }
    const { updates, events } = res.getValue();
    if (updates.status) {
      this._status = updates.status;
    }
    this._domainEvents.push(...events);
    return Result.ok(undefined);
  }

  addCategory(categoryId: string): void {
    if (!this._categoryIds.includes(categoryId)) {
      this._categoryIds.push(categoryId);
    }
  }

  removeCategory(categoryId: string): void {
    this._categoryIds = this._categoryIds.filter((id) => id !== categoryId);
  }

  addImage(url: string): void {
    if (!this._images.includes(url)) {
      this._images.push(url);
    }
  }
}
