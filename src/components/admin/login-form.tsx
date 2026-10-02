"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SubmitButton } from "@/components/admin/submit-button";
import { inputClass } from "@/components/admin/ui";
import { type LoginState, login } from "@/lib/actions/auth";

export function LoginForm({ from }: { from: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <p className="font-serif text-4xl tracking-tight">
          Panel<span className="text-accent">.</span>
        </p>
        <p className="mt-3 text-sm text-muted">Acceso restringido al administrador del sitio.</p>

        <form action={formAction} className="mt-8 space-y-4">
          <input type="hidden" name="from" value={from} />
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium tracking-wider text-muted uppercase">
              Correo
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@pablo.cl"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium tracking-wider text-muted uppercase">
              Contraseña
            </span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </label>

          {state.error ? (
            <p role="alert" className="text-sm text-accent">
              {state.error}
            </p>
          ) : null}

          <SubmitButton className="w-full justify-center">Entrar</SubmitButton>
        </form>

        <p className="mt-6 text-xs text-muted">
          <Link href="/" className="underline underline-offset-4 hover:text-accent">
            ← Volver al sitio público
          </Link>
        </p>
      </div>
    </div>
  );
}
