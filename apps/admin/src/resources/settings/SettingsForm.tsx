'use client';

import {
  Badge,
  Button,
  Card,
  Input,
  Slider,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from '@pranakaia/ui';
import {
  AppWindow,
  Building2,
  Clock,
  Database,
  Globe,
  HardDrive,
  Layers,
  Loader2,
  MapPin,
  Megaphone,
  Network,
  Palette,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  Smartphone,
  Store,
  Tag,
  TestTube,
  Truck,
  UserCheck,
  Users,
  Webhook,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { updateStoreSettings } from '@/actions/settings';
import { AdminSecurityPanel } from './AdminSecurityPanel';

interface StoreSettings {
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

interface SettingsFormProps {
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

export function SettingsForm({ initialData }: SettingsFormProps) {
  const { tenant, store, security } = initialData;
  const storeSettings = (store?.settings as StoreSettings) || {};
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    tenantName: tenant?.name ?? '',
    storeName: store?.name ?? '',
    currency: storeSettings.currency ?? 'CLP',
    contactEmail: storeSettings.contactEmail ?? '',
    // Advanced
    abTesting: {
      enabled: storeSettings.abTesting?.enabled ?? false,
      weightA: storeSettings.abTesting?.weightA ?? 50,
    },
    pprEnabled: storeSettings.pprEnabled ?? true,
    maintenanceMode: storeSettings.maintenanceMode ?? false,
    shipping: {
      freeShippingThreshold: storeSettings.shipping?.freeShippingThreshold ?? 50000,
      localDeliveryConcepcion: storeSettings.shipping?.localDeliveryConcepcion ?? true,
      zones: storeSettings.shipping?.zones ?? [
        { id: '1', name: 'Región Metropolitana', price: 4900 },
        { id: '2', name: 'Regiones Centro/Sur', price: 5900 },
        { id: '3', name: 'Zonas Extremas (Arica/Punta Arenas)', price: 9900 },
      ],
    },
    webhooks: storeSettings.webhooks ?? [
      { id: '1', name: 'ERP Integrator', url: 'https://api.erp.cl/webhook', active: false },
      { id: '2', name: 'BlueExpress Logistics', url: 'https://v1.bluex.cl/api', active: true },
    ],
    seo: {
      titlePrefix: storeSettings.seo?.titlePrefix ?? '',
      description: storeSettings.seo?.description ?? '',
      ogImage: storeSettings.seo?.ogImage ?? '',
      gtmId: storeSettings.seo?.gtmId ?? '',
    },
    branding: {
      primaryColor: storeSettings.branding?.primaryColor ?? '#000000',
      secondaryColor: storeSettings.branding?.secondaryColor ?? '#ffffff',
      borderRadius: storeSettings.branding?.borderRadius ?? '8px',
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const result = await updateStoreSettings({
        tenantId: tenant.id,
        storeId: store.id,
        ...formData,
      });
      const payload = (
        result as {
          data?: { success?: boolean; error?: string; errorCode?: string };
          serverError?: string;
        }
      ).data;

      if (payload?.success) {
        toast({
          title: '💎 Blindaje Actualizado',
          description: 'La configuración Shopify Plus++ se ha guardado correctamente.',
        });
        return;
      }

      if (payload?.errorCode === 'MFA_REQUIRED' || payload?.errorCode === 'STEP_UP_REQUIRED') {
        setActiveTab('security');
      }

      toast({
        variant: 'destructive',
        title: payload?.errorCode === 'MFA_REQUIRED' ? '🔐 MFA obligatorio' : '❌ Error Crítico',
        description:
          payload?.error ??
          (result as { serverError?: string }).serverError ??
          'No se pudieron sincronizar los cambios con la infraestructura.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
          <p className="text-sm text-gray-500">
            Gestión de infraestructura y experiencia de usuario Tier 0
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-black hover:bg-zinc-800 text-white"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Certificar Cambios
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0 mb-8 border-b border-zinc-100 rounded-none w-full justify-start">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-zinc-100 data-[state=active]:shadow-none px-4 py-2 border-b-2 border-transparent data-[state=active]:border-black rounded-none"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="shipping"
            className="data-[state=active]:bg-zinc-100 data-[state=active]:shadow-none px-4 py-2 border-b-2 border-transparent data-[state=active]:border-black rounded-none"
          >
            Logística
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="data-[state=active]:bg-zinc-100 data-[state=active]:shadow-none px-4 py-2 border-b-2 border-transparent data-[state=active]:border-black rounded-none"
          >
            Infraestructura
          </TabsTrigger>
          <TabsTrigger
            value="marketing"
            className="data-[state=active]:bg-zinc-100 data-[state=active]:shadow-none px-4 py-2 border-b-2 border-transparent data-[state=active]:border-black rounded-none"
          >
            Marketing & SEO
          </TabsTrigger>
          <TabsTrigger
            value="branding"
            className="data-[state=active]:bg-zinc-100 data-[state=active]:shadow-none px-4 py-2 border-b-2 border-transparent data-[state=active]:border-black rounded-none"
          >
            Marca & Estilo
          </TabsTrigger>
          <TabsTrigger
            value="webhooks"
            className="data-[state=active]:bg-zinc-100 data-[state=active]:shadow-none px-4 py-2 border-b-2 border-transparent data-[state=active]:border-black rounded-none"
          >
            Integraciones
          </TabsTrigger>
          <TabsTrigger
            value="access"
            className="data-[state=active]:bg-zinc-100 data-[state=active]:shadow-none px-4 py-2 border-b-2 border-transparent data-[state=active]:border-black rounded-none"
          >
            Personal y RBAC
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-zinc-100 data-[state=active]:shadow-none px-4 py-2 border-b-2 border-transparent data-[state=active]:border-black rounded-none"
          >
            Seguridad
          </TabsTrigger>
          <TabsTrigger
            value="maintenance"
            className="data-[state=active]:bg-zinc-100 data-[state=active]:shadow-none px-4 py-2 border-b-2 border-transparent data-[state=active]:border-black rounded-none"
          >
            Disponibilidad
          </TabsTrigger>
          <TabsTrigger
            value="experiments"
            className="data-[state=active]:bg-zinc-100 data-[state=active]:shadow-none px-4 py-2 border-b-2 border-transparent data-[state=active]:border-black rounded-none"
          >
            A/B Testing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="p-6 border-zinc-200 shadow-sm overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
              <Building2 size={80} />
            </div>
            <div className="mb-6 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-zinc-900" />
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold uppercase tracking-wider">Organización</h2>
                <p className="text-xs text-zinc-500">Datos legales y contractuales</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Razón Social</label>
                <Input
                  value={formData.tenantName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tenantName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nivel de Soporte SLA</label>
                <div className="flex items-center gap-2 pt-2">
                  <Badge
                    variant="default"
                    className="bg-zinc-900 text-gold border-none font-bold px-3 py-1"
                  >
                    {tenant?.plan === 'ENTERPRISE' ? 'PLATINUM 24/7' : 'ENTERPRISE Tier 3'}
                  </Badge>
                  <span className="text-[10px] text-zinc-400 font-mono tracking-tighter">
                    Válido hasta Dic 2026
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-zinc-200 shadow-sm relative overflow-hidden">
            <div className="mb-6 flex items-center gap-2">
              <Store className="h-5 w-5 text-zinc-900" />
              <h2 className="text-lg font-semibold uppercase tracking-wider">Tienda</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre de la Instancia</label>
                <Input
                  value={formData.storeName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, storeName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Moneda del Libro Mayor</label>
                <div className="flex gap-2">
                  <Input
                    className="flex-1"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))
                    }
                    maxLength={3}
                  />
                  <div className="flex items-center gap-1 bg-zinc-50 px-3 rounded-md border text-xs font-mono">
                    <RefreshCcw className="h-3 w-3 animate-spin text-zinc-400" />
                    BCC: Fixed
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Maestro de Contacto</label>
                <Input
                  placeholder="admin@pranakaia.cl"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-6">
          <Card className="p-6 border-zinc-200 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <Truck className="h-5 w-5 text-zinc-900" />
              <h2 className="text-lg font-semibold uppercase tracking-wider">Logística Regional</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-zinc-900 text-white rounded-lg border border-zinc-800 shadow-lg">
                <div className="space-y-0.5">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-prana-gold" /> Despacho Local Concepción
                  </label>
                  <p className="text-xs text-zinc-400">
                    Tarifa plana $0 para Concepción, Talcahuano y San Pedro de la Paz.
                  </p>
                </div>
                <Switch
                  checked={formData.shipping.localDeliveryConcepcion}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      shipping: { ...prev.shipping, localDeliveryConcepcion: checked },
                    }))
                  }
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" /> Envío Gratis desde (CLP)
                </label>
                <Input
                  type="number"
                  value={formData.shipping.freeShippingThreshold}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      shipping: { ...prev.shipping, freeShippingThreshold: Number(e.target.value) },
                    }))
                  }
                />
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                  Configuración actual: Compras sobre $
                  {formData.shipping.freeShippingThreshold.toLocaleString('es-CL')} envían sin costo
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-100">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Layers className="h-4 w-4" /> Tarifario por Zona
                </h3>
                <div className="space-y-3">
                  {formData.shipping.zones.map((zone, idx) => (
                    <div
                      key={zone.id}
                      className="flex items-center justify-between p-3 bg-zinc-50 border rounded-md"
                    >
                      <span className="text-sm font-medium">{zone.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400">$</span>
                        <input
                          type="number"
                          className="w-20 bg-transparent text-sm font-bold border-none p-0 focus:ring-0"
                          value={zone.price}
                          onChange={(e) => {
                            const newZones = [...formData.shipping.zones];
                            const targetZone = newZones[idx];
                            if (targetZone) {
                              targetZone.price = Number(e.target.value);
                              setFormData((prev) => ({
                                ...prev,
                                shipping: { ...prev.shipping, zones: newZones },
                              }));
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card className="p-6 border-zinc-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
              <Palette size={80} />
            </div>
            <div className="mb-6 flex items-center gap-2">
              <Palette className="h-5 w-5 text-zinc-900" />
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold uppercase tracking-wider">Identidad Visual</h2>
                <p className="text-xs text-zinc-500">Configuración de colores y tokens de diseño</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full border border-black/10"
                    style={{ backgroundColor: formData.branding.primaryColor }}
                  />
                  Color Primario
                </label>
                <div className="flex gap-2">
                  <Input
                    className="flex-1 font-mono uppercase"
                    value={formData.branding.primaryColor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        branding: { ...prev.branding, primaryColor: e.target.value },
                      }))
                    }
                  />
                  <input
                    type="color"
                    className="w-10 h-10 border border-zinc-200 rounded-md cursor-pointer"
                    value={formData.branding.primaryColor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        branding: { ...prev.branding, primaryColor: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full border border-black/10"
                    style={{ backgroundColor: formData.branding.secondaryColor }}
                  />
                  Color Secundario
                </label>
                <div className="flex gap-2">
                  <Input
                    className="flex-1 font-mono uppercase"
                    value={formData.branding.secondaryColor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        branding: { ...prev.branding, secondaryColor: e.target.value },
                      }))
                    }
                  />
                  <input
                    type="color"
                    className="w-10 h-10 border border-zinc-200 rounded-md cursor-pointer"
                    value={formData.branding.secondaryColor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        branding: { ...prev.branding, secondaryColor: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Borde de Componentes</label>
                <Input
                  className="font-mono"
                  value={formData.branding.borderRadius}
                  placeholder="8px"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      branding: { ...prev.branding, borderRadius: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-100 grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter">
                  <Smartphone className="h-4 w-4" /> App Icon & Assets
                </h3>
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-zinc-50 border-dashed">
                  <div className="w-16 h-16 bg-white border rounded shadow-sm flex items-center justify-center p-2">
                    <Image
                      src="/logos/pranakaia-icon-new.png"
                      alt="Logo Icon"
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-bold font-mono">LOGO-MASTER-PNG</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                      Resolución: 1024x1024 px
                    </p>
                    <Button variant="outline" size="sm" className="h-6 text-[9px] uppercase">
                      Cambiar Isotipo
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter">
                  <AppWindow className="h-4 w-4" /> Favicon Maestro
                </h3>
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-zinc-50 border-dashed">
                  <div className="w-16 h-16 bg-white border rounded shadow-sm flex items-center justify-center p-2">
                    <div className="w-8 h-8 bg-zinc-200 rounded animate-pulse" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-bold font-mono">FAVICON-ENTERPRISE-ICO</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                      Resolución: 32x32 px
                    </p>
                    <Button variant="outline" size="sm" className="h-6 text-[9px] uppercase">
                      Cambiar Archivo
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card className="p-6 border-zinc-200 shadow-sm relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-5 rotate-12">
              <Network size={200} />
            </div>
            <div className="mb-6 flex items-center gap-2">
              <Webhook className="h-5 w-5 text-indigo-500" />
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold tracking-wider">Flujos de Datos</h2>
                <p className="text-xs text-zinc-500">Gestión de Webhooks y Web APIs</p>
              </div>
            </div>

            <div className="space-y-4">
              {formData.webhooks.map((hook, idx) => (
                <div
                  key={hook.id}
                  className="group flex flex-col p-4 bg-zinc-50 rounded-lg border border-zinc-100 hover:bg-white hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-zinc-600">
                      <Database className="h-3 w-3" /> {hook.name}
                    </span>
                    <Switch
                      checked={hook.active}
                      onCheckedChange={(checked) => {
                        const newHooks = [...formData.webhooks];
                        const targetHook = newHooks[idx];
                        if (targetHook) {
                          targetHook.active = checked;
                          setFormData((prev) => ({ ...prev, webhooks: newHooks }));
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-zinc-200/50 text-[10px] font-mono p-2 rounded border border-zinc-300 focus:outline-none"
                      value={hook.url}
                      onChange={(e) => {
                        const newHooks = [...formData.webhooks];
                        const targetHook = newHooks[idx];
                        if (targetHook) {
                          targetHook.url = e.target.value;
                          setFormData((prev) => ({ ...prev, webhooks: newHooks }));
                        }
                      }}
                    />
                    <Button variant="outline" size="sm" className="h-8 text-[10px] gap-1 px-2">
                      <RefreshCcw className="h-3 w-3" /> REPROCESAR
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full h-10 border-dashed gap-2 uppercase text-xs"
              >
                + Crear Nueva Integración No-Code
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <Card className="p-6 border-zinc-200 shadow-sm relative overflow-hidden">
            <div className="mb-6 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold tracking-wider uppercase">
                  Acceso y Auditoría
                </h2>
                <p className="text-xs text-zinc-500">
                  Security Level: Tier 0 (Total Access Control)
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="p-4 bg-zinc-900 text-white rounded-lg shadow-2xl relative overflow-hidden">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase font-bold text-zinc-500 tracking-widest mb-1">
                        Sesión Actual
                      </p>
                      <h3 className="font-bold flex items-center gap-2 text-sm">
                        <UserCheck className="h-4 w-4 text-green-400" /> Pablo (Owner / Super Admin)
                      </h3>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-none">
                      Active Multi-Region
                    </Badge>
                  </div>
                  <div className="flex gap-4 border-t border-zinc-800 pt-4">
                    <div className="flex-1 text-center">
                      <p className="text-[10px] uppercase text-zinc-500">Region</p>
                      <p className="text-[11px] font-mono">SA-EAST-1 (Chile)</p>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-[10px] uppercase text-zinc-500">IP Status</p>
                      <p className="text-[11px] font-mono text-green-400">Verificado TLS/VPN</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Users className="h-3 w-3" /> Gestión de Roles RBAC
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto p-4 items-start gap-1 group hover:border-black"
                  >
                    <span className="text-xs font-bold">Manager Logística</span>
                    <span className="text-[10px] text-zinc-500">Acceso a Stock y Despachos</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto p-4 items-start gap-1 group hover:border-black"
                  >
                    <span className="text-xs font-bold">Marketing Analyst</span>
                    <span className="text-[10px] text-zinc-500">Acceso a SEO y Cupones</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <AdminSecurityPanel initialState={security} />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card className="p-6 border-zinc-200 shadow-sm transition-all duration-500 group">
            <div className="mb-6 flex items-center gap-2">
              <Globe className="h-5 w-5 text-sky-500 animate-pulse" />
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold tracking-wider uppercase">Estado de la Red</h2>
                <p className="text-xs text-zinc-500">Control de visibilidad e-commerce</p>
              </div>
            </div>

            <div className="space-y-6">
              <div
                className={`flex items-center justify-between p-6 rounded-xl border transition-all duration-500 shadow-inner ${
                  formData.maintenanceMode
                    ? 'bg-amber-50 border-amber-200 shadow-amber-200/50'
                    : 'bg-zinc-50 border-zinc-100 shadow-zinc-100/50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-zinc-900" />
                    <label className="text-base font-bold text-zinc-900">Modo Mantenimiento</label>
                  </div>
                  <p className="text-xs text-zinc-500 max-w-sm">
                    {formData.maintenanceMode
                      ? '⚠️ TIENDA CERRADA: Los clientes verán la página de mantenimiento de PranaKaia.'
                      : '✅ TIENDA ACTIVA: El sitio es visible para todo el tráfico global.'}
                  </p>
                </div>
                <Switch
                  checked={formData.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, maintenanceMode: checked }))
                  }
                  className="scale-125"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 border-dashed border-zinc-300 flex flex-col items-center justify-center text-center gap-3 group-hover:border-zinc-500 transition-colors">
                  <Megaphone className="h-5 w-5 text-zinc-400 group-hover:text-amber-500 transition-colors" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1">
                      Flash Sale Mode
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Activa optimización avanzada de caché para drops masivos de tráfico.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-[10px] uppercase font-bold"
                  >
                    PREPARAR LANZAMIENTO
                  </Button>
                </Card>
                <Card className="p-4 border-dashed border-zinc-300 flex flex-col items-center justify-center text-center gap-3">
                  <Network className="h-5 w-5 text-zinc-400" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1">
                      Queue-it™ Sync
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Sincronización con sala de espera virtual (Tier Plus++).
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">
                    CONNECTED: 18ms latency
                  </Badge>
                </Card>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="p-6 border-zinc-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="h-20 w-20 text-amber-500" />
            </div>
            <div className="mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold uppercase tracking-wider">
                  Aceleración y Edge
                </h2>
                <p className="text-xs text-zinc-500">Configuración de cómputo en el borde</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-100 transition-all hover:bg-zinc-100">
                <div className="space-y-0.5">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Layers className="h-4 w-4 text-zinc-400" /> Partial Prerendering (PPR)
                  </label>
                  <p className="text-xs text-zinc-500">
                    Streaming dinámico con esqueletos estáticos ultra-rápidos (Next.js 15).
                  </p>
                </div>
                <Switch
                  checked={formData.pprEnabled}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, pprEnabled: checked }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                  <h3 className="text-xs font-bold text-blue-900 flex items-center gap-2 uppercase tracking-tighter">
                    <Globe className="h-3 w-3" /> Global Edge Network
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge className="bg-blue-500 text-white border-none text-[9px]">ACTIVE</Badge>
                    <span className="text-[10px] text-blue-700 font-mono">Anycast IP Enabled</span>
                  </div>
                </div>
                <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-100">
                  <h3 className="text-xs font-bold text-amber-900 flex items-center gap-2 uppercase tracking-tighter">
                    <HardDrive className="h-3 w-3" /> Cache Tiering
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge className="bg-amber-500 text-white border-none text-[9px]">
                      OPTIMIZED
                    </Badge>
                    <span className="text-[10px] text-amber-700 font-mono">SWR: 3600s</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          <Card className="p-6 border-zinc-200 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <Search className="h-5 w-5 text-zinc-900" />
              <h2 className="text-lg font-semibold uppercase tracking-wider">SEO Global</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prefijo de Título</label>
                <Input
                  placeholder="Ej: PranaKaia | "
                  value={formData.seo.titlePrefix}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, titlePrefix: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Meta Descripción</label>
                <Input
                  placeholder="Descripción para Google..."
                  value={formData.seo.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, description: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">GTM ID (Google Tag Manager)</label>
                <Input
                  placeholder="GTM-XXXXXXX"
                  value={formData.seo.gtmId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, gtmId: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-6">
          <Card className="p-6 border-zinc-200 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <TestTube className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold">Motor de A/B Testing</h2>
            </div>
            <div className="space-y-8">
              <div className="flex items-center justify-between p-4 bg-purple-50/30 rounded-lg border border-purple-100">
                <div className="space-y-0.5">
                  <label className="text-sm font-semibold">Capa de Experimentación</label>
                  <p className="text-xs text-zinc-500">
                    Activar bucketización de usuarios en el Edge Middleware.
                  </p>
                </div>
                <Switch
                  checked={formData.abTesting.enabled}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      abTesting: { ...prev.abTesting, enabled: checked },
                    }))
                  }
                />
              </div>

              {formData.abTesting.enabled && (
                <div className="space-y-6 pt-4 border-t border-zinc-100 animate-in fade-in duration-500">
                  <div className="space-y-6 max-w-md">
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-zinc-600">Bucket A: Original</span>
                        <span className="font-bold tabular-nums">
                          {formData.abTesting.weightA}%
                        </span>
                      </div>
                      <Slider
                        value={[formData.abTesting.weightA]}
                        max={100}
                        step={1}
                        onValueChange={(val) =>
                          setFormData((prev) => ({
                            ...prev,
                            abTesting: { ...prev.abTesting, weightA: val[0] ?? 50 },
                          }))
                        }
                      />
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-purple-600">Bucket B: Experimento</span>
                        <span className="font-bold tabular-nums text-purple-600">
                          {100 - formData.abTesting.weightA}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-zinc-900 text-zinc-100 rounded-md shadow-lg">
                    <p className="text-xs leading-relaxed">
                      <span className="text-amber-400 font-bold">PRO TIP:</span> La asignación se
                      realiza mediante la cookie{' '}
                      <code className="bg-zinc-800 px-1 rounded text-amber-200">
                        pk_experiment_bucket
                      </code>{' '}
                      persistida durante 30 días en el navegador del cliente.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
