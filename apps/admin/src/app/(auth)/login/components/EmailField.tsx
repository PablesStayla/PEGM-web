'use client';

import { Input } from '@pranakaia/ui';
import { Mail } from 'lucide-react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface EmailFieldProps {
  register: UseFormRegisterReturn;
  error?: string;
  disabled?: boolean;
}

export function EmailField({ register, error, disabled }: EmailFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="email"
        className="ml-1 text-[11px] font-bold uppercase tracking-widest text-[#14b8a6]/80"
      >
        Identificador de Usuario (Staff)
      </label>
      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Mail className="h-4 w-4 text-gray-500 transition-colors group-focus-within:text-[#14b8a6]" />
        </div>
        <Input
          id="email"
          type="email"
          {...register}
          disabled={disabled}
          placeholder="admin@pranakaia.com"
          className={`h-14 rounded-2xl border-white/5 bg-white/[0.03] pl-11 text-white placeholder-gray-600 backdrop-blur-sm transition-all focus:border-[#14b8a6]/30 focus:bg-white/[0.05] focus:ring-2 focus:ring-[#14b8a6]/10 ${
            error ? 'border-red-500/50' : ''
          }`}
        />
      </div>
      {error && <p className="ml-1 text-[10px] font-medium text-red-400/80">{error}</p>}
    </div>
  );
}
