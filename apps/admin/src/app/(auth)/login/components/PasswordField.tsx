'use client';

import { Input } from '@pranakaia/ui';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface PasswordFieldProps {
  register: UseFormRegisterReturn;
  error?: string;
  disabled?: boolean;
}

export function PasswordField({ register, error, disabled }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label
        htmlFor="password"
        className="ml-1 text-[11px] font-bold uppercase tracking-widest text-[#14b8a6]/80"
      >
        Clave de Acceso SafeAction
      </label>
      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Lock className="h-4 w-4 text-gray-500 transition-colors group-focus-within:text-[#14b8a6]" />
        </div>
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          {...register}
          disabled={disabled}
          placeholder="••••••••••••"
          className={`h-14 rounded-2xl border-white/5 bg-white/[0.03] pl-11 pr-12 text-white placeholder-gray-600 backdrop-blur-sm transition-all focus:border-[#14b8a6]/30 focus:bg-white/[0.05] focus:ring-2 focus:ring-[#14b8a6]/10 ${
            error ? 'border-red-500/50' : ''
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-[#14b8a6] transition-colors"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="ml-1 text-[10px] font-medium text-red-400/80">{error}</p>}
    </div>
  );
}
