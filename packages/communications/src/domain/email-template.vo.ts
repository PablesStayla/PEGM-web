/**
 * EmailTemplate Value Object — Communications Bounded Context
 */

/**
 * Pre-defined email template identifiers used across the system.
 *
 * @example
 * ```ts
 * const templateId: EmailTemplateId = 'order-confirmation';
 * ```
 */
export type EmailTemplateId =
  | 'order-confirmation'
  | 'order-shipped'
  | 'order-cancelled'
  | 'password-reset'
  | 'email-verification'
  | 'welcome'
  | 'supplier-onboarding';

/**
 * Email template with subject and Handlebars-style variables.
 *
 * @example
 * ```ts
 * const template: EmailTemplate = {
 *   id: 'order-confirmation',
 *   subject: 'Tu pedido {{orderNumber}} fue confirmado',
 *   variables: { orderNumber: 'ORD-001', customerName: 'Pablo' },
 * };
 * ```
 */
export interface EmailTemplate {
  readonly id: EmailTemplateId;
  readonly subject: string;
  /** Handlebars-style variables to inject into the template */
  readonly variables: Record<string, string | number>;
}
