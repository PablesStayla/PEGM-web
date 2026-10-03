"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon, icons } from "@/components/icons";
import { logout } from "@/lib/actions/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: icons.dashboard, exact: true },
  { href: "/admin/proyectos", label: "Proyectos", icon: icons.folder },
  { href: "/admin/experiencia", label: "Experiencia", icon: icons.briefcase },
  { href: "/admin/educacion", label: "Formación", icon: icons.graduation },
  { href: "/admin/habilidades", label: "Habilidades", icon: icons.tools },
  { href: "/admin/mensajes", label: "Mensajes", icon: icons.mail },
  { href: "/admin/auditoria", label: "Auditoría", icon: icons.history },
  { href: "/admin/ajustes", label: "Ajustes", icon: icons.settings },
];

export function AdminShell({
  email,
  unread,
  children,
}: {
  email: string;
  unread: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-surface">
      {open ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-ink/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#1c1815] text-[#ece7e0] transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <Link href="/admin" className="font-serif text-lg tracking-tight">
            Panel<span className="text-[#d08a55]">.</span>
          </Link>
          <button
            type="button"
            aria-label="Cerrar menú"
            className="p-1 text-white/60 hover:text-white lg:hidden"
            onClick={() => setOpen(false)}
          >
            <Icon path={icons.x} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-[#d08a55]/15 text-[#d08a55]"
                        : "text-white/65 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon path={item.icon} className="size-4 shrink-0" />
                    {item.label}
                    {item.href === "/admin/mensajes" && unread > 0 ? (
                      <span className="ml-auto rounded-full bg-[#d08a55] px-2 py-0.5 text-[10px] font-medium text-[#1c1815]">
                        {unread}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          <p className="truncate px-3 pb-2 text-xs text-white/40">{email}</p>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-white/65 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Icon path={icons.logout} className="size-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-line bg-bg/90 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setOpen(true)}
            className="flex size-9 items-center justify-center border border-line text-muted"
          >
            <Icon path={icons.menu} />
          </button>
          <span className="ml-3 font-serif text-lg">
            Panel<span className="text-accent">.</span>
          </span>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">{children}</main>
      </div>
    </div>
  );
}
