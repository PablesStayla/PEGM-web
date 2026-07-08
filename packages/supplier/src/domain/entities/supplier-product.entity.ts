import { Entity, type ProductId, Result, type SupplierId } from '@pranakaia/shared-kernel';
import { z } from 'zod';

/**
 * Zod schema for SupplierProduct entity validation.
 *
 * @example
 * ```ts
 * const parsed = SupplierProductPropsSchema.safeParse(row);
 * ```
 */
export const SupplierProductPropsSchema = z.object({
  supplierId: z.string().min(1),
  supplierProductId: z.string().min(1),
  productId: z.string().min(1),
  sku: z.string().min(1),
  name: z.string().min(1),
  externalUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SupplierProductProps = z.infer<typeof SupplierProductPropsSchema>;

/**
 * SupplierProduct Entity — maps an internal product to its external supplier counterpart.
 *
 * Stores the supplier's product ID, SKU, and cost for dropshipping operations.
 *
 * @example
 * ```ts
 * const result = SupplierProduct.create({
 *   supplierId: 'sup_1' as SupplierId,
 *   productId: 'prod_1' as ProductId,
 *   supplierProductId: 'ext_42',
 *   sku: 'ALI-CAM-M',
 *   name: 'Camiseta Eco',
 * });
 * ```
 */
export class SupplierProduct extends Entity<string> {
  private constructor(
    id: string,
    private _props: SupplierProductProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(
    props: Omit<SupplierProductProps, 'createdAt' | 'updatedAt' | 'isActive'>,
  ): Result<SupplierProduct, Error> {
    const now = new Date();
    const entityProps: SupplierProductProps = {
      ...props,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const validation = SupplierProductPropsSchema.safeParse(entityProps);
    if (!validation.success) {
      return Result.err(new Error(`Invalid supplier product props: ${validation.error.message}`));
    }

    const id = `${props.supplierId}_${props.supplierProductId}`;
    return Result.ok(new SupplierProduct(id, entityProps, now, now));
  }

  public static reconstitute(props: SupplierProductProps): Result<SupplierProduct, Error> {
    const validation = SupplierProductPropsSchema.safeParse(props);
    if (!validation.success) {
      return Result.err(
        new Error(`Invalid supplier product props for reconstitution: ${validation.error.message}`),
      );
    }

    const id = `${props.supplierId}_${props.supplierProductId}`;
    return Result.ok(new SupplierProduct(id, props, props.createdAt, props.updatedAt));
  }

  get supplierId(): SupplierId {
    return this._props.supplierId as SupplierId;
  }

  get supplierProductId(): string {
    return this._props.supplierProductId;
  }

  get productId(): ProductId {
    return this._props.productId as ProductId;
  }

  get sku(): string {
    return this._props.sku;
  }

  get name(): string {
    return this._props.name;
  }

  get externalUrl() {
    return this._props.externalUrl;
  }

  get isActive(): boolean {
    return this._props.isActive;
  }

  toPrimitives(): SupplierProductProps {
    return { ...this._props };
  }
}

/**
 * @deprecated Use SupplierProduct instead
 */
export const SupplierProductEntity = SupplierProduct;
