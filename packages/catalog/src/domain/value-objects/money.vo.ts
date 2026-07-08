/**
 * Money Value Object — re-exported from @pranakaia/shared-kernel.
 *
 * The canonical Money implementation lives in shared-kernel since v0.5.0.
 * This re-export preserves backward compatibility for existing consumers.
 *
 * @deprecated Import from `@pranakaia/shared-kernel` instead.
 */
export {
  type CurrencyCode,
  Money,
  MoneyError,
  type MoneyProps,
  VALID_CURRENCIES,
} from '@pranakaia/shared-kernel';
