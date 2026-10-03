"use client";

import { Icon, icons } from "@/components/icons";

/**
 * Botón de envío con confirmación nativa (para acciones destructivas).
 */
export function ConfirmButton({
  message,
  children,
}: {
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className="inline-flex items-center gap-1.5 border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
    >
      <Icon path={icons.trash} className="size-3.5" />
      {children ?? "Eliminar"}
    </button>
  );
}
