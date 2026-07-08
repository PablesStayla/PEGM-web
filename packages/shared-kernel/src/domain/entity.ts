/**
 * A branded string type for unique identifiers.
 * This prevents using plain strings where a specific ID type is expected.
 */
export type BrandedId = string & { readonly __brand: unique symbol };

/**
 * Interface for object-based entity identifiers.
 */
export interface EntityId {
  value: string;
  equals(other: EntityId): boolean;
  toString(): string;
}

/**
 * Union type for all supported entity identifier types.
 */
export type EntityIdType = BrandedId | EntityId | string;

/**
 * Abstract class representing a Domain Entity.
 *
 * In Domain-Driven Design, an Entity is an object that is defined by its identity
 * rather than its attributes. It has a life cycle and its identity remains
 * consistent even if its properties change.
 *
 * @template T - The type of the Entity's identifier.
 */
export abstract class Entity<T extends EntityIdType> {
  /**
   * The unique identifier for this entity.
   */
  public readonly id: T;

  /**
   * Optional metadata for tracking when the entity was created and updated.
   */
  protected readonly props: {
    createdAt: Date;
    updatedAt: Date;
  };

  /**
   * Creates a new Entity instance.
   *
   * @param id - The unique identifier for the entity.
   * @param createdAt - Optional creation date.
   * @param updatedAt - Optional update date.
   */
  protected constructor(id: T, createdAt?: Date, updatedAt?: Date) {
    this.id = id;
    this.props = {
      createdAt: createdAt ?? new Date(),
      updatedAt: updatedAt ?? new Date(),
    };
  }

  /**
   * Returns the creation date of the entity.
   */
  public get createdAt(): Date {
    return this.props.createdAt;
  }

  /**
   * Returns the last update date of the entity.
   */
  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Gets the raw value of the identifier.
   */
  public get idValue(): string {
    if (typeof this.id === 'string') {
      return this.id;
    }
    return (this.id as EntityId).value;
  }

  /**
   * Compares this entity with another for equality based on identity.
   *
   * @param other - The other entity to compare with.
   * @returns True if both entities have the same identity and are of the same type.
   */
  public equals(other?: Entity<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (this === other) {
      return true;
    }

    if (!(other instanceof Entity)) {
      return false;
    }

    return this.idValue === other.idValue;
  }
}
