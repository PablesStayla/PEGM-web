import { createHmac } from 'node:crypto';
import { env } from '@/lib/env';

interface FlowClientConfig {
  apiKey: string;
  secretKey: string;
  sandbox: boolean;
}

interface FlowCreatePaymentPayload {
  commerceOrder: string;
  subject: string;
  amount: number;
  currency: string;
  email: string;
  urlConfirmation: string;
  urlReturn: string;
}

interface FlowCreatePaymentResponse {
  url: string;
  token: string;
  flowOrder: number;
}

interface FlowPaymentStatusResponse {
  status: number;
  flowOrder: number;
  commerceOrder: string;
  amount: number;
  currency?: string;
}

class FlowClient {
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor(config: FlowClientConfig) {
    this.apiKey = config.apiKey;
    this.secretKey = config.secretKey;
    this.baseUrl = config.sandbox ? 'https://sandbox.flow.cl/api' : 'https://www.flow.cl/api';
  }

  private sign(params: Record<string, string | number>): string {
    const message = Object.keys(params)
      .sort()
      .map((key) => `${key}${params[key]}`)
      .join('');

    return createHmac('sha256', this.secretKey).update(message).digest('hex');
  }

  async post<T>(endpoint: string, params: Record<string, string | number>): Promise<T> {
    const payload: Record<string, string | number> = {
      apiKey: this.apiKey,
      ...params,
    };

    payload['s'] = this.sign(payload);

    const body = new URLSearchParams();
    for (const [key, value] of Object.entries(payload)) {
      body.append(key, String(value));
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      throw new Error(`Flow API responded with HTTP ${response.status} on ${endpoint}`);
    }

    return response.json() as Promise<T>;
  }
}

let flowClient: FlowClient | null = null;

function getFlowClient(): FlowClient {
  if (flowClient) {
    return flowClient;
  }

  if (!env.FLOW_API_KEY || !env.FLOW_SECRET_KEY) {
    throw new Error('FLOW_API_KEY and FLOW_SECRET_KEY are required for Flow client');
  }

  flowClient = new FlowClient({
    apiKey: env.FLOW_API_KEY,
    secretKey: env.FLOW_SECRET_KEY,
    sandbox: env.FLOW_SANDBOX || env.NODE_ENV !== 'production',
  });

  return flowClient;
}

export async function createFlowPayment(
  payload: FlowCreatePaymentPayload,
): Promise<FlowCreatePaymentResponse> {
  return getFlowClient().post<FlowCreatePaymentResponse>('/payment/create', { ...payload });
}

interface FlowVerificationResult {
  success: boolean;
  flowOrder: number;
  status: number;
  orderId: string;
  amount: number;
  currency: string;
}

export const flowHelpers = {
  async verifyPayment(token: string): Promise<FlowVerificationResult> {
    const response = await getFlowClient().post<FlowPaymentStatusResponse>('/payment/getStatus', {
      token,
    });

    return {
      success: Number(response.status) === 2,
      flowOrder: Number(response.flowOrder),
      status: Number(response.status),
      orderId: String(response.commerceOrder),
      amount: Number(response.amount),
      currency: response.currency ?? 'CLP',
    };
  },
};
