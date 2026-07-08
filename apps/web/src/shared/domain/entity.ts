/**
 * Base Entity class for Domain-Driven Design
 * All domain entities should extend this class
 */
export abstract class Entity<T> {
  protected readonly _id: T;

  constructor(id: T) {
    this._id = id;
  }

  get id(): T {
    return this._id;
  }

  /**
   * Check if two entities are equal based on their ID
   */
  equals(entity?: Entity<T> | null): boolean {
    if (!entity) {
      return false;
    }
    if (this === entity) {
      return true;
    }
    return this._id === entity._id;
  }
}
