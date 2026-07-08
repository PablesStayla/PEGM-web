/**
 * Password Hasher Port — defines the contract for hashing and verifying passwords.
 *
 * @example
 * ```ts
 * class BcryptPasswordHasher implements IPasswordHasher {
 *   async hash(password) { return bcrypt.hash(password, 12); }
 *   async verify(password, hash) { return bcrypt.compare(password, hash); }
 * }
 * ```
 */
export interface IPasswordHasher {
  /**
   * Hashes a plain text password.
   *
   * @param password - Plain text password.
   * @returns Hashed password string.
   *
   * @example
   * ```ts
   * const hash = await hasher.hash('p@ssword123');
   * ```
   */
  hash(password: string): Promise<string>;

  /**
   * Verifies a plain text password against a stored hash.
   *
   * @param password - Plain text password.
   * @param hash - Stored hash.
   * @returns `true` if the password matches.
   *
   * @example
   * ```ts
   * const valid = await hasher.verify('p@ssword123', storedHash);
   * ```
   */
  verify(password: string, hash: string): Promise<boolean>;
}
