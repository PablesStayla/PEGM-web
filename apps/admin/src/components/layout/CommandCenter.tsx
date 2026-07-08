'use client';

import { cn } from '@pranakaia/ui';
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  BoxIcon,
  Brain,
  FileText,
  LayoutDashboard,
  Monitor,
  Package,
  Percent,
  Radio,
  Search,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  Warehouse,
  Webhook,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const commands = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, group: 'Principal' },
  { name: 'Órdenes', href: '/orders', icon: ShoppingCart, group: 'Principal' },
  { name: 'Productos', href: '/products', icon: Package, group: 'Principal' },
  { name: 'Inventario', href: '/inventory', icon: Truck, group: 'Principal' },
  { name: 'Clientes', href: '/customers', icon: Users, group: 'Principal' },
  { name: 'Proveedores', href: '/suppliers', icon: Warehouse, group: 'Comercial' },
  { name: 'Dropship', href: '/dropship-orders', icon: BoxIcon, group: 'Comercial' },
  { name: 'Descuentos', href: '/discounts', icon: Percent, group: 'Comercial' },
  { name: 'Notificaciones', href: '/notifications', icon: Bell, group: 'Comercial' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, group: 'Reportes' },
  { name: 'Reportes', href: '/reports', icon: FileText, group: 'Reportes' },
  { name: 'Actividad', href: '/activity', icon: Activity, group: 'Reportes' },
  { name: 'Webhooks Log', href: '/activity/webhooks', icon: Webhook, group: 'Sistema' },
  { name: 'Rentabilidad', href: '/profitability', icon: Wallet, group: 'Inteligencia' },
  { name: 'Live Commerce', href: '/live-commerce', icon: Radio, group: 'Inteligencia' },
  { name: 'Automatización', href: '/automation', icon: Bot, group: 'Inteligencia' },
  { name: 'Supply Chain AI', href: '/supply-chain', icon: Brain, group: 'Inteligencia' },
  { name: 'Monitoreo', href: '/monitoring', icon: Monitor, group: 'Sistema' },
  { name: 'Configuración', href: '/settings', icon: Settings, group: 'Sistema' },
];

export function CommandCenter() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const filteredCommands =
    query === ''
      ? commands
      : commands.filter(
          (cmd) =>
            cmd.name.toLowerCase().includes(query.toLowerCase()) ||
            cmd.group.toLowerCase().includes(query.toLowerCase()),
        );

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      setOpen(false);
      setQuery('');
    },
    [router],
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (open) {
      setSelectedIndex(0);
      setQuery('');
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      if (filteredCommands[selectedIndex]) {
        navigate(filteredCommands[selectedIndex].href);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-prana-dark-green/60 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Centro de comandos"
        tabIndex={-1}
        className="w-full max-w-2xl bg-black/80 border border-prana-gold/20 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5),0_0_20px_rgba(212,175,55,0.1)] overflow-hidden animate-in zoom-in-95 duration-300 relative"
        onKeyDown={handleKeyDown}
      >
        {/* Decorative Ambience inside Omnibar */}
        <div className="absolute inset-0 bg-mesh-forest opacity-10 pointer-events-none" />
        <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />

        <div className="flex items-center px-6 py-5 border-b border-white/5 relative z-10 bg-white/[0.02]">
          <Search className="w-5 h-5 text-prana-gold/60 mr-4" />
          <input
            className="w-full bg-transparent text-white outline-none placeholder:text-white/20 text-xl font-medium tracking-tight"
            placeholder="Comando maestro o búsqueda rápida..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/30 text-[10px] font-black uppercase tracking-widest ml-4">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">
          {filteredCommands.length === 0 ? (
            <div className="py-16 text-center text-white/40 italic font-light relative z-10">
              No se hallaron registros para "{query}"
            </div>
          ) : (
            Object.entries(
              filteredCommands.reduce(
                (acc, cmd) => {
                  const group = acc[cmd.group] ?? [];
                  group.push(cmd);
                  acc[cmd.group] = group;
                  return acc;
                },
                {} as Record<string, typeof commands>,
              ),
            ).map(([group, cmds]) => (
              <div key={group} className="mb-4 relative z-10">
                <div className="px-4 py-2 text-[9px] font-black text-prana-gold/30 uppercase tracking-[0.3em]">
                  {group}
                </div>
                {cmds.map((cmd) => {
                  const isSelected = filteredCommands[selectedIndex]?.href === cmd.href;
                  return (
                    <button
                      key={cmd.href}
                      className={cn(
                        'w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-300',
                        isSelected
                          ? 'bg-prana-gold/10 text-white shadow-[0_0_15px_rgba(212,175,55,0.1)] ring-1 ring-prana-gold/30'
                          : 'text-white/40 hover:bg-white/5 hover:text-white',
                      )}
                      onClick={() => navigate(cmd.href)}
                    >
                      <cmd.icon
                        className={cn(
                          'w-4.5 h-4.5 transition-colors',
                          isSelected
                            ? 'text-prana-gold drop-shadow-[0_0_5px_rgba(212,175,55,0.4)]'
                            : 'text-white/20',
                        )}
                      />
                      <span className="flex-1 font-bold tracking-tight">{cmd.name}</span>
                      {isSelected && (
                        <kbd className="text-[9px] text-prana-gold/40 font-black tracking-widest">
                          ENTER
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-5 border-t border-white/5 bg-black/40 relative z-10 flex items-center justify-between text-[10px] text-white/30 font-black uppercase tracking-widest">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <kbd className="px-1.5 py-1 rounded bg-white/5 border border-white/10 min-w-[20px] text-center font-mono">
                ↑↓
              </kbd>
              Navegar
            </span>
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 font-mono">
                ENTER
              </kbd>
              Ejecutar
            </span>
          </div>
          <div className="flex items-center gap-2">
            WAR ROOM OMNIBAR <span className="text-prana-gold/20">v2.0.0</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-label="Cerrar centro de comandos"
        className="fixed inset-0 -z-10"
        onClick={() => setOpen(false)}
      />
    </div>
  );
}
