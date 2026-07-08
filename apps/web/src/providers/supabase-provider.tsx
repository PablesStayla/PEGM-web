'use client';

import type { RealtimeChannelSendResponse, SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { observabilityLogger } from '@/lib/logger';

const SupabaseContext = createContext<{ supabase: SupabaseClient } | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() =>
    createClient(
      process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '',
      process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? '',
    ),
  );

  useEffect(() => {
    // Patrón Keepalive para Realtime (ADR-003)
    // Supabase Realtime puede desconectarse por inactividad o fallos de red.
    const channel = supabase.channel('system-keepalive');

    channel
      .on('system', { event: '*' }, (payload: Record<string, unknown>) => {
        observabilityLogger.debug('[Realtime] System event', { payload });
      })
      .subscribe((status: RealtimeChannelSendResponse) => {
        if (status === 'error') {
          observabilityLogger.warn('[Realtime] Channel error detected. Attempting reconnect...');
          setTimeout(() => {
            channel.subscribe();
          }, 3000);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return <SupabaseContext.Provider value={{ supabase }}>{children}</SupabaseContext.Provider>;
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
