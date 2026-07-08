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
import { Shield } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { verify2FAToken } from '@/lib/security/2fa';

interface TwoFactorVerifyProps {
  secret: string;
  email: string;
  onVerified: () => void;
  onUseBackupCode: () => void;
}

export function TwoFactorVerify({
  secret,
  email,
  onVerified,
  onUseBackupCode,
}: TwoFactorVerifyProps) {
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      toast({
        title: 'Invalid code',
        description: 'Please enter a 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);
    try {
      const isValid = await verify2FAToken(token, secret, email);

      if (isValid) {
        onVerified();
      } else {
        toast({
          title: 'Invalid code',
          description: 'The code you entered is incorrect',
          variant: 'destructive',
        });
        setToken('');
      }
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to verify code',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && token.length === 6) {
      handleVerify();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>Enter the 6-digit code from your authenticator app</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="2fa-token">Verification Code</Label>
          <Input
            id="2fa-token"
            placeholder="000000"
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyPress={handleKeyPress}
            maxLength={6}
            className="text-center text-2xl tracking-widest"
            autoFocus
            disabled={isVerifying}
          />
        </div>

        <Button
          onClick={handleVerify}
          disabled={isVerifying || token.length !== 6}
          className="w-full"
        >
          {isVerifying ? 'Verifying...' : 'Verify'}
        </Button>

        <div className="text-center">
          <Button variant="link" size="sm" onClick={onUseBackupCode}>
            Use backup code instead
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
