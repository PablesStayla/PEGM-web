// =====================================================
// PAYMENT GATEWAY SELECTOR - MULTI-GATEWAY STRATEGY
// =====================================================

/**
 * Available payment gateways
 */
export type PaymentGateway = 'stripe' | 'flow';

/**
 * Gateway selection criteria
 */
export interface GatewaySelectionParams {
  country: string;
  amount: number;
  currency: string;
  userPreference?: 'card' | 'bank' | 'any';
  customerEmail?: string;
}

/**
 * Gateway capabilities
 */
interface GatewayCapabilities {
  countries: string[];
  currencies: string[];
  minAmount: number;
  maxAmount: number;
  commission: number;
  methods: string[];
}

/**
 * Gateway configurations
 */
const GATEWAY_CONFIGS: Record<PaymentGateway, GatewayCapabilities> = {
  stripe: {
    countries: ['*'], // Global
    currencies: ['USD', 'CLP', 'EUR', 'GBP', 'ARS', 'MXN'],
    minAmount: 50, // 50 cents
    maxAmount: 999999999,
    commission: 0.035, // 3.5%
    methods: ['card', 'bank_transfer', 'wallet'],
  },
  flow: {
    countries: ['CL'], // Chile only
    currencies: ['CLP'],
    minAmount: 50, // 50 pesos
    maxAmount: 100000000, // 100 million pesos
    commission: 0.029, // 2.9% + IVA
    methods: ['card', 'bank_transfer', 'webpay', 'servipag', 'multicaja'],
  },
};

/**
 * Smart gateway selection based on criteria
 */
export function selectPaymentGateway(params: GatewaySelectionParams): PaymentGateway {
  const { country, amount, currency, userPreference } = params;

  // Rule 1: Chile + CLP = prefer Flow (lower commission)
  if (country === 'CL' && currency === 'CLP') {
    // Check if amount is within Flow limits
    const flow = GATEWAY_CONFIGS.flow;
    if (amount >= flow.minAmount && amount <= flow.maxAmount) {
      return 'flow';
    }
  }

  // Rule 2: International or non-CLP currency = Stripe
  if (country !== 'CL' || currency !== 'CLP') {
    return 'stripe';
  }

  // Rule 3: User preference for bank transfer in Chile = Flow
  if (country === 'CL' && userPreference === 'bank') {
    return 'flow';
  }

  // Default: Stripe (most versatile)
  return 'stripe';
}

/**
 * Get gateway capabilities
 */
export function getGatewayCapabilities(gateway: PaymentGateway): GatewayCapabilities {
  return GATEWAY_CONFIGS[gateway];
}

/**
 * Check if gateway supports country
 */
export function isGatewayAvailable(
  gateway: PaymentGateway,
  country: string,
  currency: string,
): boolean {
  const config = GATEWAY_CONFIGS[gateway];

  const supportsCountry = config.countries.includes('*') || config.countries.includes(country);

  const supportsCurrency = config.currencies.includes(currency);

  return supportsCountry && supportsCurrency;
}

/**
 * Calculate commission for gateway
 */
export function calculateCommission(gateway: PaymentGateway, amount: number): number {
  const config = GATEWAY_CONFIGS[gateway];
  // Round to 2 decimals to avoid floating-point precision issues
  return Math.round(amount * config.commission * 100) / 100;
}

/**
 * Get available gateways for country/currency
 */
export function getAvailableGateways(country: string, currency: string): PaymentGateway[] {
  return Object.keys(GATEWAY_CONFIGS).filter((gateway) =>
    isGatewayAvailable(gateway as PaymentGateway, country, currency),
  ) as PaymentGateway[];
}

/**
 * Compare gateways and recommend best option
 */
export function compareGateways(params: GatewaySelectionParams): {
  recommended: PaymentGateway;
  alternatives: Array<{
    gateway: PaymentGateway;
    commission: number;
    savings: number;
  }>;
} {
  const available = getAvailableGateways(params.country, params.currency);
  const recommended = selectPaymentGateway(params);

  const alternatives = available
    .filter((g) => g !== recommended)
    .map((gateway) => {
      const commission = calculateCommission(gateway, params.amount);
      const recommendedCommission = calculateCommission(recommended, params.amount);
      const savings = recommendedCommission - commission;

      return {
        gateway,
        commission,
        savings,
      };
    })
    .sort((a, b) => b.savings - a.savings);

  return {
    recommended,
    alternatives,
  };
}

export default selectPaymentGateway;
