'use client';

import { Button, Input, Label, useToast } from '@pranakaia/ui';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { requestPasswordReset } = await import('@/app/actions/forgot-password');
      const result = await requestPasswordReset({ email });

      if (result.success) {
        setIsSuccess(true);
        toast({
          title: 'Email enviado',
          description:
            result.message || 'Revisa tu bandeja de entrada para restablecer tu contraseña',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Error al enviar el email',
          variant: 'destructive',
        });
      }
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Error de conexión. Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Email Enviado</h2>
            <p className="mt-4 text-gray-600">
              Hemos enviado un enlace para restablecer tu contraseña a <strong>{email}</strong>
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Si no recibes el email en unos minutos, revisa tu carpeta de spam.
            </p>
          </div>

          <div className="space-y-4">
            <Button onClick={() => setIsSuccess(false)} variant="outline" className="w-full">
              Enviar nuevamente
            </Button>

            <Link
              href="/login"
              className="block text-center text-primary-600 hover:text-primary-500"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link
            href="/login"
            className="inline-flex items-center text-primary-600 hover:text-primary-500 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio de sesión
          </Link>

          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-600">
            <Mail className="h-6 w-6 text-white" />
          </div>

          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tu email y te enviaremos un enlace para restablecerla
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Label htmlFor="email">Correo electrónico</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="pl-10"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full" size="lg">
            {isLoading ? 'Enviando...' : 'Enviar enlace de restablecimiento'}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Recordaste tu contraseña?{' '}
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Inicia sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
