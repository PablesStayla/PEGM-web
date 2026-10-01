"use client";

import { useActionState } from "react";
import { Icon, icons } from "@/components/icons";
import {
  sendMessage,
  type ContactState,
} from "@/lib/actions/messages";

const initial: ContactState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(
    sendMessage,
    initial,
  );

  if (state.ok) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center border border-line bg-surface p-8 text-center">
        <span className="flex size-11 items-center justify-center rounded-full border border-accent text-accent">
          <Icon path={icons.check} className="size-5" />
        </span>
        <h3 className="mt-4 font-serif text-xl">¡Mensaje enviado!</h3>
        <p className="mt-2 max-w-xs text-sm text-muted">
          Gracias por escribirme. Te responderé a la brevedad.
        </p>
      </div>
    );
  }

  const field =
    "w-full border border-line bg-bg px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent";

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="mb-1.5 block text-xs font-medium tracking-wider text-muted uppercase">
            Nombre
          </label>
          <input
            id="nombre"
            name="name"
            required
            autoComplete="name"
            placeholder="Tu nombre"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="correo" className="mb-1.5 block text-xs font-medium tracking-wider text-muted uppercase">
            Correo
          </label>
          <input
            id="correo"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@correo.cl"
            className={field}
          />
        </div>
      </div>

      <div>
        <label htmlFor="mensaje" className="mb-1.5 block text-xs font-medium tracking-wider text-muted uppercase">
          Mensaje
        </label>
        <textarea
          id="mensaje"
          name="body"
          required
          rows={5}
          minLength={10}
          placeholder="Cuéntame sobre tu proyecto o consulta…"
          className={`${field} resize-y`}
        />
      </div>

      {/* Honeypot anti-bots: invisible para humanos */}
      <input
        type="text"
        name="empresa"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] size-0 opacity-0"
      />

      {state.error ? (
        <p role="alert" className="border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 bg-ink px-6 py-3 text-sm text-bg transition-colors hover:bg-accent disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar mensaje"}
        <Icon path={icons.send} className="size-3.5" />
      </button>
    </form>
  );
}
