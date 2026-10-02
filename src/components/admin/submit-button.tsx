"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children = "Guardar",
  variant = "solid",
  className,
}: {
  children?: React.ReactNode;
  variant?: "solid" | "ghost";
  className?: string;
}) {
  const { pending } = useFormStatus();

  const base = "inline-flex items-center gap-2 text-sm transition-colors disabled:opacity-60";
  const style =
    variant === "solid"
      ? "bg-ink px-5 py-2.5 text-bg hover:bg-accent"
      : "border border-line px-4 py-2 text-muted hover:border-accent hover:text-accent";

  return (
    <button type="submit" disabled={pending} className={`${base} ${style} ${className ?? ""}`}>
      {pending ? "Guardando…" : children}
    </button>
  );
}
