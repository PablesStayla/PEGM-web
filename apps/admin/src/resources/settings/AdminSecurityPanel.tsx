'use client';

import { Badge, Button, Card, Input, useToast } from '@pranakaia/ui';
import { ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  beginAdminMfaEnrollment,
  disableAdminMfa,
  enableAdminMfa,
  verifyAdminStepUp,
} from '@/actions/security';

type AdminSecurityState = {
  email: string;
  mfaEnabled: boolean;
  enrolledAt: string | null;
  backupCodesRemaining: number;
  stepUpActive: boolean;
};

interface AdminSecurityPanelProps {
  initialState: AdminSecurityState;
}

export function AdminSecurityPanel({ initialState }: AdminSecurityPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [securityState, setSecurityState] = useState(initialState);
  const [enrollment, setEnrollment] = useState<{ secret: string; qrCode: string } | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [stepUpCode, setStepUpCode] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const normalizeCode = (value: string) => value.trim().toUpperCase();

  const downloadBackupCodes = () => {
    const text = backupCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'pranakaia-admin-backup-codes.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleStartEnrollment = async () => {
    setIsBusy(true);
    try {
      const result = await beginAdminMfaEnrollment();
      const data = (
        result as {
          data?: { success?: boolean; data?: { secret: { base32: string }; qrCode: string } };
        }
      ).data;

      if (!data?.success || !data.data) {
        throw new Error('No se pudo iniciar el enrolamiento MFA');
      }

      setEnrollment({
        secret: data.data.secret.base32,
        qrCode: data.data.qrCode,
      });
      setBackupCodes([]);
    } catch {
      toast({
        variant: 'destructive',
        title: '❌ Error MFA',
        description: 'No se pudo generar el código QR para MFA.',
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleEnableMfa = async () => {
    if (!enrollment?.secret) {
      return;
    }

    setIsBusy(true);
    try {
      const result = await enableAdminMfa({
        secret: enrollment.secret,
        token: normalizeCode(verificationCode),
      });
      const data = (
        result as {
          data?: {
            success?: boolean;
            data?: AdminSecurityState & { backupCodes: string[] };
          };
        }
      ).data;

      if (!data?.success || !data.data) {
        throw new Error('No se pudo habilitar MFA');
      }

      setSecurityState({
        email: data.data.email,
        mfaEnabled: data.data.mfaEnabled,
        enrolledAt: data.data.enrolledAt,
        backupCodesRemaining: data.data.backupCodesRemaining,
        stepUpActive: true,
      });
      setBackupCodes(data.data.backupCodes);
      setEnrollment(null);
      setVerificationCode('');
      toast({
        title: '🔐 MFA activado',
        description: 'La cuenta admin ahora requiere un segundo factor.',
      });
      router.refresh();
    } catch {
      toast({
        variant: 'destructive',
        title: '❌ Código inválido',
        description: 'Verifica el código de tu app autenticadora o usa uno nuevo.',
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleVerifyStepUp = async () => {
    setIsBusy(true);
    try {
      const result = await verifyAdminStepUp({ code: normalizeCode(stepUpCode) });
      const data = (
        result as { data?: { success?: boolean; error?: string; data?: AdminSecurityState } }
      ).data;

      if (!data?.success || !data.data) {
        throw new Error(data?.error || 'No se pudo verificar la sesión MFA');
      }

      setSecurityState(data.data);
      setStepUpCode('');
      toast({
        title: '✅ Sesión elevada',
        description: 'Ya puedes ejecutar cambios sensibles durante los próximos minutos.',
      });
      router.refresh();
    } catch {
      toast({
        variant: 'destructive',
        title: '❌ Verificación fallida',
        description: 'El código MFA o backup code no es válido.',
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleDisableMfa = async () => {
    setIsBusy(true);
    try {
      const result = await disableAdminMfa({ code: normalizeCode(disableCode) });
      const data = (result as { data?: { success?: boolean; data?: AdminSecurityState } }).data;

      if (!data?.success || !data.data) {
        throw new Error('No se pudo desactivar MFA');
      }

      setSecurityState(data.data);
      setDisableCode('');
      setBackupCodes([]);
      toast({
        title: '⚠️ MFA desactivado',
        description: 'La protección adicional fue removida de la cuenta admin.',
      });
      router.refresh();
    } catch {
      toast({
        variant: 'destructive',
        title: '❌ No se pudo desactivar',
        description: 'Debes confirmar con un código MFA válido o un backup code.',
      });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-zinc-200 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold tracking-wider uppercase">MFA y Step-Up</h2>
            <p className="text-xs text-zinc-500">Protección fuerte para configuración global</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Cuenta protegida
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge className={securityState.mfaEnabled ? 'bg-emerald-600' : 'bg-zinc-700'}>
                {securityState.mfaEnabled ? 'MFA ACTIVO' : 'MFA INACTIVO'}
              </Badge>
              {securityState.stepUpActive ? (
                <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                  STEP-UP VIGENTE
                </Badge>
              ) : null}
            </div>
            <p className="mt-3 text-xs text-zinc-600">{securityState.email}</p>
            <p className="text-xs text-zinc-500">
              Backup codes restantes: {securityState.backupCodesRemaining}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 md:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Sesión elevada
            </p>
            <p className="mt-2 text-sm text-zinc-700">
              Los cambios en configuración global exigen una verificación MFA reciente.
            </p>
            <div className="mt-4 flex gap-2">
              <Input
                placeholder="123456 o ABCD-EFGH"
                value={stepUpCode}
                onChange={(e) => setStepUpCode(e.target.value)}
                disabled={!securityState.mfaEnabled || isBusy}
              />
              <Button
                type="button"
                onClick={handleVerifyStepUp}
                disabled={!securityState.mfaEnabled || !stepUpCode || isBusy}
              >
                Verificar sesión
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {!securityState.mfaEnabled ? (
        <Card className="p-6 border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">Activar MFA</h3>
              <p className="text-xs text-zinc-500">
                Habilita TOTP para proteger ajustes, operaciones críticas y elevación de sesión.
              </p>
            </div>
            <Button type="button" onClick={handleStartEnrollment} disabled={isBusy}>
              Generar QR
            </Button>
          </div>

          {enrollment ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-zinc-200 bg-white p-4 flex items-center justify-center">
                <Image src={enrollment.qrCode} alt="QR MFA" width={220} height={220} />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Clave manual
                  </p>
                  <p className="mt-2 rounded-md bg-zinc-950 p-3 font-mono text-xs text-zinc-100 break-all">
                    {enrollment.secret}
                  </p>
                </div>
                <Input
                  placeholder="Código de 6 dígitos"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  disabled={isBusy}
                />
                <Button
                  type="button"
                  onClick={handleEnableMfa}
                  disabled={!verificationCode || isBusy}
                  className="w-full"
                >
                  Confirmar activación
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      ) : (
        <Card className="p-6 border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">Desactivar MFA</h3>
              <p className="text-xs text-zinc-500">
                Esta acción queda auditada como crítica y requiere un código vigente.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Código MFA o backup code"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value)}
              disabled={isBusy}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleDisableMfa}
              disabled={!disableCode || isBusy}
            >
              Desactivar MFA
            </Button>
          </div>
        </Card>
      )}

      {backupCodes.length > 0 ? (
        <Card className="p-6 border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">Backup Codes</h3>
              <p className="text-xs text-zinc-500">
                Guárdalos fuera del navegador. Cada uno sirve una sola vez.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={downloadBackupCodes}>
              Descargar
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-zinc-50 p-4 md:grid-cols-5">
            {backupCodes.map((code) => (
              <div
                key={code}
                className="rounded border border-zinc-200 bg-white p-2 text-center font-mono text-xs"
              >
                {code}
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
