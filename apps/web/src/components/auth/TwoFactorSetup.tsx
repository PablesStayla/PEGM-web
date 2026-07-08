'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@pranakaia/ui';
import { CheckCircle2, Copy, Shield } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generate2FASecret, generateBackupCodes, verify2FAToken } from '@/lib/security/2fa';

interface TwoFactorSetupProps {
  email: string;
  onComplete: (secret: string, backupCodes: string[]) => Promise<void>;
}

export function TwoFactorSetup({ email, onComplete }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'initial' | 'scan' | 'verify' | 'backup'>('initial');
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [token, setToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const { secret: newSecret, qrCode: newQR } = await generate2FASecret(email);
      setSecret(newSecret.base32);
      setQrCode(newQR);
      setStep('scan');
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to generate 2FA secret',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      toast({
        title: 'Invalid code',
        description: 'Please enter a 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    const isValid = await verify2FAToken(token, secret, email);

    if (isValid) {
      const codes = generateBackupCodes(10);
      setBackupCodes(codes);
      setStep('backup');
    } else {
      toast({
        title: 'Invalid code',
        description: 'The code you entered is incorrect',
        variant: 'destructive',
      });
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await onComplete(secret, backupCodes);
      toast({
        title: 'Success',
        description: 'Two-factor authentication enabled',
      });
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to enable 2FA',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast({
      title: 'Copied',
      description: 'Secret key copied to clipboard',
    });
  };

  const downloadBackupCodes = () => {
    const text = backupCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (step === 'initial') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Enable Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Two-factor authentication (2FA) provides an additional security layer by requiring both
            your password and a verification code from your authenticator app.
          </p>
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Get Started'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'scan') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scan QR Code</CardTitle>
          <CardDescription>Use your authenticator app to scan this QR code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Image src={qrCode} alt="2FA QR Code" width={200} height={200} />
          </div>

          <div>
            <Label>Or enter this key manually:</Label>
            <div className="flex gap-2">
              <Input value={secret} readOnly className="font-mono text-sm" />
              <Button size="icon" variant="outline" onClick={copySecret}>
                {copiedCode ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button onClick={() => setStep('verify')} className="w-full">
            Continue to Verification
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'verify') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verify Code</CardTitle>
          <CardDescription>Enter the 6-digit code from your authenticator app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="token">Verification Code</Label>
            <Input
              id="token"
              placeholder="000000"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('scan')} className="w-full">
              Back
            </Button>
            <Button onClick={handleVerify} className="w-full">
              Verify
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'backup') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Save Backup Codes</CardTitle>
          <CardDescription>Store these codes safely. Each can only be used once.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-4">
            {backupCodes.map((code, i) => (
              <div key={i} className="font-mono text-sm">
                {code}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadBackupCodes} className="w-full">
              Download Codes
            </Button>
            <Button onClick={handleComplete} disabled={isLoading} className="w-full">
              {isLoading ? 'Enabling...' : 'Complete Setup'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
