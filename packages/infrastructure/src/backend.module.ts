import { ProductService } from '@pranakaia/catalog';
import {
  CheckoutPaymentService,
  CheckoutService,
  CheckoutValidator,
  OrderService,
} from '@pranakaia/checkout';
import { InventoryService } from '@pranakaia/inventory';
import { FlowPaymentGateway } from './gateways/flow-payment-gateway';
import { StripePaymentGateway } from './gateways/stripe-payment-gateway';
import { DrizzleInventoryRepository } from './repositories/drizzle-inventory-repository';
import { DrizzleOrderRepository } from './repositories/drizzle-order-repository';
import { DrizzleProductRepository } from './repositories/drizzle-product-repository';
import { DrizzleWebhookLogRepository } from './repositories/drizzle-webhook-log-repository';

export interface BackendConfig {
  stripe: {
    secretKey: string;
  };
  flow: {
    apiKey: string;
    secretKey: string;
    sandbox: boolean;
  };
  siteUrl: string;
}

type BackendEnv = {
  STRIPE_SECRET_KEY?: string;
  FLOW_API_KEY?: string;
  FLOW_SECRET_KEY?: string;
  NODE_ENV?: string;
  NEXT_PUBLIC_SITE_URL?: string;
};

/**
 * BackendModule — Composition Root (Staff Level)
 *
 * Centraliza la instanciación de servicios con sus dependencias
 * inyectadas y configuradas. Esto asegura que la lógica de negocio
 * sea idéntica en cualquier aplicación (Web, Admin, CLI, Jobs).
 */
export class BackendModule {
  private static config: BackendConfig;

  private static resolveConfigFromEnv(env: BackendEnv): BackendConfig {
    return {
      stripe: {
        secretKey: env['STRIPE_SECRET_KEY'] || '',
      },
      flow: {
        apiKey: env['FLOW_API_KEY'] || '',
        secretKey: env['FLOW_SECRET_KEY'] || '',
        sandbox: env['NODE_ENV'] !== 'production',
      },
      siteUrl: env['NEXT_PUBLIC_SITE_URL'] || 'http://localhost:3000',
    };
  }

  /**
   * Inicializa la configuración global del backend.
   * Debe llamarse una vez al inicio del ciclo de vida de la aplicación.
   */
  static configure(config: BackendConfig) {
    BackendModule.config = config;
  }

  private static checkConfig() {
    if (!BackendModule.config) {
      throw new Error('BackendModule not configured. Call BackendModule.configure() first.');
    }
  }

  /**
   * Retorna una instancia configurada de CheckoutService.
   * Selecciona automáticamente el gateway según la moneda.
   */
  static getCheckoutService(currency = 'CLP'): CheckoutService {
    BackendModule.checkConfig();

    const orderRepository = new DrizzleOrderRepository();
    const productRepository = new DrizzleProductRepository();

    const gateway =
      currency === 'CLP'
        ? new FlowPaymentGateway({
            ...BackendModule.config.flow,
            siteUrl: BackendModule.config.siteUrl,
          })
        : new StripePaymentGateway({
            secretKey: BackendModule.config.stripe.secretKey,
            siteUrl: BackendModule.config.siteUrl,
          });

    const inventoryRepository = new DrizzleInventoryRepository();
    const inventoryService = new InventoryService(inventoryRepository);
    const orderService = new OrderService(orderRepository);

    const checkoutValidator = new CheckoutValidator(productRepository);
    const checkoutPaymentService = new CheckoutPaymentService(
      gateway as unknown as ConstructorParameters<typeof CheckoutPaymentService>[0],
    );

    return new CheckoutService(
      orderService,
      inventoryService,
      checkoutValidator,
      checkoutPaymentService,
    );
  }

  /**
   * Retorna el repositorio de órdenes configurado.
   */
  static getOrderRepository(): DrizzleOrderRepository {
    return new DrizzleOrderRepository();
  }

  /**
   * Retorna el repositorio de productos configurado.
   */
  static getProductRepository(): DrizzleProductRepository {
    return new DrizzleProductRepository();
  }

  /**
   * Retorna el repositorio de logs de webhooks configurado.
   */
  static getWebhookLogRepository(): DrizzleWebhookLogRepository {
    return new DrizzleWebhookLogRepository();
  }

  /**
   * Retorna una instancia configurada de ProductService.
   */
  static getProductService(): ProductService {
    const productRepository = BackendModule.getProductRepository();
    const saveAggregate = async <T>(fn: (tx: unknown) => Promise<T>): Promise<T> => {
      return fn(null);
    };
    return new ProductService(
      productRepository,
      saveAggregate as unknown as ConstructorParameters<typeof ProductService>[1],
    );
  }

  /**
   * Helper para bootstrap rápido en Server Actions (Web App).
   * Intenta configurar automáticamente si detecta variables de entorno.
   */
  static async bootstrap(env: BackendEnv = process.env): Promise<typeof BackendModule> {
    if (BackendModule.config) {
      return BackendModule;
    }

    BackendModule.configure(BackendModule.resolveConfigFromEnv(env));
    return BackendModule;
  }
}
