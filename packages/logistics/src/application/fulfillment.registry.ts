import { BigBuyFulfillmentProvider } from './bigbuy-fulfillment.provider';
import type { FulfillmentProvider } from './fulfillment.types';

const providerRegistry = new Map<string, FulfillmentProvider>();

/** Configuration needed to auto-register fulfillment providers. */
export interface FulfillmentConfig {
  supplierApiUrl?: string;
  supplierApiKey?: string;
}

/**
 * Registra un proveedor de fulfillment para uso posterior con resolveFulfillmentProvider().
 */
export function registerFulfillmentProvider(provider: FulfillmentProvider): void {
  providerRegistry.set(provider.name, provider);
}

/**
 * Obtiene el proveedor de fulfillment registrado por nombre.
 * Crea instancia de BigBuy automáticamente si config lo permite.
 *
 * @param providerName - Name of the provider to resolve.
 * @param config - Optional configuration for auto-registration (DI-injected, no process.env).
 * @returns The resolved FulfillmentProvider.
 * @throws {Error} If the provider is not registered and cannot be auto-created.
 */
export function resolveFulfillmentProvider(
  providerName: string,
  config?: FulfillmentConfig,
): FulfillmentProvider {
  // Auto-resolver BigBuy with injected config (no process.env)
  if (providerName === 'bigbuy' && !providerRegistry.has('bigbuy')) {
    resolveBigBuyProvider(config);
  }

  const provider = providerRegistry.get(providerName);
  if (!provider) {
    throw new Error(
      `[FulfillmentService] Provider "${providerName}" not registered. ` +
        'Call registerFulfillmentProvider() before using resolveFulfillmentProvider().',
    );
  }
  return provider;
}

function resolveBigBuyProvider(config?: FulfillmentConfig) {
  const { supplierApiUrl, supplierApiKey } = config || {};
  if (supplierApiUrl && supplierApiKey) {
    const provider = new BigBuyFulfillmentProvider({
      apiUrl: supplierApiUrl,
      apiKey: supplierApiKey,
    });
    registerFulfillmentProvider(provider);
  }
}
