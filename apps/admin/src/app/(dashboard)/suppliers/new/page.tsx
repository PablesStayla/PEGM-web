'use client';

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@pranakaia/ui';
import React, { useTransition } from 'react';
import { createSupplierAction } from '@/resources/suppliers/actions';

type UiState =
  | { kind: 'idle' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; message: string };

export default function NewSupplierPage() {
  const [state, setState] = React.useState<UiState>({ kind: 'idle' });
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const name = String(formData.get('name') ?? '');
    const apiEndpoint = String(formData.get('apiEndpoint') ?? '');
    const apiKey = String(formData.get('apiKey') ?? '');
    const emailRaw = formData.get('email');
    const email = emailRaw ? String(emailRaw) : undefined;
    const syncFrequency = String(formData.get('syncFrequency') ?? 'HOURLY') as
      | 'REALTIME'
      | 'HOURLY'
      | 'DAILY';

    startTransition(async () => {
      const result = (await createSupplierAction({
        name,
        apiEndpoint,
        apiKey,
        email: email as any,
        syncFrequency,
      })) as any;

      if (result?.serverError) {
        setState({ kind: 'error', message: String(result.serverError) });
        return;
      }

      const data = result?.data;
      if (data?.success) {
        setState({ kind: 'success', message: String(data.message ?? 'Proveedor creado') });
        (e.currentTarget as HTMLFormElement).reset();
        return;
      }

      setState({ kind: 'error', message: 'No se pudo crear el proveedor' });
    });
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Connect New Supplier</h1>

      {state.kind === 'error' && (
        <div className="bg-red-50 text-red-700 p-4 rounded mb-6 border border-red-200">
          <p className="font-semibold">Error</p>
          <p>{state.message}</p>
        </div>
      )}

      {state.kind === 'success' && (
        <div className="bg-green-50 text-green-700 p-4 rounded mb-6 border border-green-200">
          <p>{state.message}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="bg-white shadow-sm border rounded-lg p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Supplier Name</Label>
          <Input id="name" name="name" placeholder="Global Drop LLC" required minLength={3} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (optional)</Label>
          <Input id="email" name="email" type="email" placeholder="contact@partner.com" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiEndpoint">API Endpoint (Inventory Source)</Label>
          <Input
            id="apiEndpoint"
            name="apiEndpoint"
            type="url"
            placeholder="https://api.partner.com/v1/stock"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key / Token</Label>
          <Input
            id="apiKey"
            name="apiKey"
            type="password"
            placeholder="••••••••••••••••"
            required
            minLength={10}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="syncFrequency">Sync Frequency</Label>
          <Select name="syncFrequency" defaultValue="HOURLY">
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HOURLY">Hourly</SelectItem>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="REALTIME">Real-time (Critical)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Connecting...' : 'Connect Supplier'}
          </Button>
        </div>
      </form>
    </div>
  );
}
