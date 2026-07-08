import { Entity } from '@pranakaia/shared-kernel';
import type {
  ProductArchived,
  ProductCreated,
  ProductPriceChanged,
  ProductPublished,
  ProductStockUpdated,
} from '../events/product.events';
import type { Money } from '../value-objects/money.vo';
import type { SKU } from '../value-objects/sku.vo';
import type { ProductId } from './product-id.vo';
import type { CreateProductProps, ProductStatus } from './product-types';
import { ProductStatusHelper } from './product-types';

/**
 * ProductState — Encapsulates the schema, state fields, getters, and primitive mappings
 * for the Product Aggregate Root.
 *
 * Helps keep files focused and modular, maintaining strict L12/SRP guidelines.
 */
export class ProductState extends Entity<ProductId> {
  protected _sku: SKU;
  protected _name: string;
  protected _description: string;
  protected _price: Money;
  protected _stockQuantity: number;
  protected _categoryIds: string[];
  protected _images: string[];
  protected _status: ProductStatus;
  protected _supplierId: string | undefined;
  protected _domainEvents: Array<
    ProductCreated | ProductPriceChanged | ProductStockUpdated | ProductPublished | ProductArchived
  > = [];

  protected constructor(props: CreateProductProps) {
    super(props.id);
    this._sku = props.sku;
    this._name = props.name;
    this._description = props.description;
    this._price = props.price;
    this._stockQuantity = props.stockQuantity;
    this._categoryIds = props.categoryIds ?? [];
    this._images = props.images ?? [];
    this._status = props.stockQuantity === 0 ? 'OUT_OF_STOCK' : 'ACTIVE';
    this._supplierId = props.supplierId;
    this._domainEvents = [];
  }

  get sku(): SKU {
    return this._sku;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get price(): Money {
    return this._price;
  }

  get stockQuantity(): number {
    return this._stockQuantity;
  }

  get categoryIds(): string[] {
    return this._categoryIds;
  }

  get images(): string[] {
    return this._images;
  }

  get status(): ProductStatus {
    return this._status;
  }

  get supplierId(): string | undefined {
    return this._supplierId;
  }

  get isAvailable(): boolean {
    return this._stockQuantity > 0 && this._status === 'ACTIVE';
  }

  get isSellable(): boolean {
    return ProductStatusHelper.isSellable(this._status);
  }

  get isVisible(): boolean {
    return ProductStatusHelper.isVisible(this._status);
  }

  get canEdit(): boolean {
    return ProductStatusHelper.canEdit(this._status);
  }

  getUncommittedEvents(): Array<
    ProductCreated | ProductPriceChanged | ProductStockUpdated | ProductPublished | ProductArchived
  > {
    return [...this._domainEvents];
  }

  clearEvents(): void {
    this._domainEvents = [];
  }

  toPrimitives() {
    return {
      id: this.idValue,
      sku: this._sku.value,
      name: this._name,
      description: this._description,
      price: this._price.toPrimitives(),
      stockQuantity: this._stockQuantity,
      categoryIds: this._categoryIds,
      images: this._images,
      status: this._status,
      supplierId: this._supplierId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
