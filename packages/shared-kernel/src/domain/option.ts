/**
 * Represents an optional value — either `Some<T>` or `None`.
 *
 * Discriminated union with `_tag` field for exhaustive pattern matching.
 *
 * @example
 * ```ts
 * const maybeUser: Option<User> = Option.some(user);
 * const nothing: Option<never> = Option.none();
 *
 * Option.match(maybeUser, {
 *   some: (u) => u.name,
 *   none: () => 'Guest',
 * });
 * ```
 */
export type Option<T> = { readonly _tag: 'Some'; readonly value: T } | { readonly _tag: 'None' };

/**
 * Utility object for creating and working with {@link Option} values.
 *
 * @example
 * ```ts
 * const opt = Option.fromNullable(nullableValue);
 * const doubled = Option.map(opt, x => x * 2);
 * const result = Option.getOrElse(doubled, 0);
 * ```
 */
export const Option = {
  /**
   * Creates a `Some` option wrapping the given value.
   *
   * @example
   * ```ts
   * const opt = Option.some(42); // { _tag: 'Some', value: 42 }
   * ```
   */
  some: <T>(value: T): Option<T> => Object.freeze({ _tag: 'Some', value }),

  /**
   * Creates a `None` option representing the absence of a value.
   *
   * @example
   * ```ts
   * const noUser: Option<User> = Option.none();
   * ```
   */
  none: (): Option<never> => Object.freeze({ _tag: 'None' }),

  /**
   * Pattern matches on an Option, calling the appropriate handler.
   *
   * @example
   * ```ts
   * Option.match(Option.some(5), { some: v => v * 2, none: () => 0 }); // 10
   * ```
   */
  match: <T, U>(opt: Option<T>, handlers: { some: (value: T) => U; none: () => U }): U =>
    opt._tag === 'Some' ? handlers.some(opt.value) : handlers.none(),

  /**
   * Transforms the value inside a `Some`, or returns `None`.
   *
   * @example
   * ```ts
   * Option.map(Option.some(5), x => x * 2); // Option.some(10)
   * Option.map(Option.none(), x => x * 2);  // Option.none()
   * ```
   */
  map: <T, U>(opt: Option<T>, fn: (value: T) => U): Option<U> =>
    opt._tag === 'Some' ? Option.some(fn(opt.value)) : Option.none(),

  /**
   * Chains an Option-returning function. Returns `None` if the input is `None`.
   *
   * @example
   * ```ts
   * Option.flatMap(Option.some(5), x => Option.some(x * 2)); // Option.some(10)
   * ```
   */
  flatMap: <T, U>(opt: Option<T>, fn: (value: T) => Option<U>): Option<U> =>
    opt._tag === 'Some' ? fn(opt.value) : Option.none(),

  /**
   * Returns the inner value if `Some`, or the default if `None`.
   *
   * @example
   * ```ts
   * Option.getOrElse(Option.some(5), 0);  // 5
   * Option.getOrElse(Option.none(), 0);   // 0
   * ```
   */
  getOrElse: <T>(opt: Option<T>, defaultValue: T): T =>
    opt._tag === 'Some' ? opt.value : defaultValue,

  /**
   * Converts a nullable value to an Option. `null`/`undefined` → `None`.
   *
   * @example
   * ```ts
   * Option.fromNullable(null);          // Option.none()
   * Option.fromNullable('hello');       // Option.some('hello')
   * ```
   */
  fromNullable: <T>(value: T | null | undefined): Option<NonNullable<T>> =>
    value != null ? Option.some(value as NonNullable<T>) : Option.none(),

  /**
   * Type guard: narrows to `Some`.
   *
   * @example
   * ```ts
   * if (Option.isSome(opt)) { opt.value; // T }
   * ```
   */
  isSome: <T>(opt: Option<T>): opt is { readonly _tag: 'Some'; readonly value: T } =>
    opt._tag === 'Some',

  /**
   * Type guard: narrows to `None`.
   *
   * @example
   * ```ts
   * if (Option.isNone(opt)) { /* no value *\/ }
   * ```
   */
  isNone: <T>(opt: Option<T>): opt is { readonly _tag: 'None' } => opt._tag === 'None',
} as const;

export const { some, none } = Option;
