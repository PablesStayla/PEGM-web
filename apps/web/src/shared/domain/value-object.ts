/**
 * Base Value Object class for Domain-Driven Design
 * Value Objects are immutable and compared by value, not identity
 */
export abstract class ValueObject<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  /**
   * Check if two value objects are equal based on their properties
   */
  equals(vo?: ValueObject<T>): boolean {
    if (!vo) {
      return false;
    }
    if (this === vo) {
      return true;
    }
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}
