export interface StoreSettings {
  currency?: string;
  contactEmail?: string;
  abTesting?: { enabled: boolean; weightA: number };
  pprEnabled?: boolean;
  maintenanceMode?: boolean;
  shipping?: {
    freeShippingThreshold: number;
    localDeliveryConcepcion: boolean;
    zones: Array<{ id: string; name: string; price: number }>;
  };
  webhooks?: Array<{ id: string; name: string; url: string; active: boolean }>;
  seo?: { titlePrefix: string; description: string; ogImage: string; gtmId: string };
  branding?: { primaryColor: string; secondaryColor: string; borderRadius: string };
}

export interface SettingsFormProps {
  initialData: {
    tenant: { id: string; name: string; plan?: string };
    store: { id: string; name: string; settings: unknown };
    security: {
      email: string;
      mfaEnabled: boolean;
      enrolledAt: string | null;
      backupCodesRemaining: number;
      stepUpActive: boolean;
    };
  };
}

export interface FormData {
  tenantName: string;
  storeName: string;
  currency: string;
  contactEmail: string;
  abTesting: {
    enabled: boolean;
    weightA: number;
  };
  pprEnabled: boolean;
  maintenanceMode: boolean;
  shipping: {
    freeShippingThreshold: number;
    localDeliveryConcepcion: boolean;
    zones: Array<{ id: string; name: string; price: number }>;
  };
  webhooks: Array<{ id: string; name: string; url: string; active: boolean }>;
  seo: {
    titlePrefix: string;
    description: string;
    ogImage: string;
    gtmId: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    borderRadius: string;
  };
}
