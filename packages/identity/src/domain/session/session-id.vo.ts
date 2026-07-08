import {
  type SessionId as BrandedSessionId,
  createSessionId,
  type Result,
} from '@pranakaia/shared-kernel';

/**
 * SessionId Value Object — branded type for type-safe session identifiers.
 *
 * @example
 * ```ts
 * const id = SessionId.generate(); // sess_1715566800000_abc123
 * const fromDb = SessionId.from('sess_42');
 * const validated = SessionId.create('sess_42'); // Result<SessionId, Error>
 * ```
 */
export type SessionId = BrandedSessionId;

/**
 * Factory namespace for SessionId creation and comparison.
 *
 * @example
 * ```ts
 * const a = SessionId.generate();
 * const b = SessionId.from('sess_1');
 * SessionId.equals(a, b); // false
 * ```
 */
export const SessionId = {
  /** Creates a validated SessionId. Returns Result — never throws. */
  create: (value: string): Result<SessionId, Error> => {
    return createSessionId(value);
  },
  /** Creates a SessionId from a trusted string (no validation). */
  from: (value: string): SessionId => value as SessionId,
  /** Generates a new unique SessionId. */
  generate: (): SessionId =>
    `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}` as SessionId,
  /** Strict equality check. */
  equals: (a: SessionId, b: SessionId): boolean => a === b,
};
