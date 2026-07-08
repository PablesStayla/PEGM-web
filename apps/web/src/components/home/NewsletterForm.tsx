'use client';

import { Button } from '@pranakaia/ui';
import { useState, useTransition } from 'react';
import { subscribeToNewsletter } from '@/app/actions/newsletter';

export function NewsletterForm() {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await subscribeToNewsletter({ email, acceptsMarketing: true });

      if (result?.success) {
        setMessage({
          type: 'success',
          text: '¡Gracias! Te has suscrito exitosamente.',
        });
        setEmail('');
      } else {
        setMessage({
          type: 'error',
          text: result?.error || 'Error al suscribirse. Intenta nuevamente.',
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu email"
          required
          disabled={isPending}
          className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 disabled:opacity-50"
          aria-label="Email para newsletter"
        />
        <Button
          type="submit"
          variant="default"
          size="lg"
          disabled={isPending}
          className="bg-white text-primary-600 hover:bg-gray-100"
        >
          {isPending ? 'Enviando...' : 'Suscribirse'}
        </Button>
      </div>

      {message && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}
    </form>
  );
}
