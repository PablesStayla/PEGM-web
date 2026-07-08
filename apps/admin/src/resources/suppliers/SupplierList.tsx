'use client';

import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@pranakaia/ui';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  CheckCircle,
  Clock,
  Globe,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

interface Supplier {
  id: string;
  name: string;
  apiEndpoint: string;
  syncFrequency: string;
  isActive: boolean;
  lastSyncAt?: string | null;
  updatedAt?: string | Date | null;
}

interface SupplierListProps {
  suppliers: Supplier[];
}

export function SupplierList({ suppliers }: SupplierListProps) {
  const activeCount = suppliers.filter((s) => s.isActive).length;
  const inactiveCount = suppliers.length - activeCount;

  return (
    <div className="space-y-10 py-6 animate-in fade-in duration-700">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 rounded-lg border border-white/5">
              <Globe className="h-6 w-6 text-prana-emerald" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              Red de <span className="text-prana-emerald">Proveedores</span>
            </h1>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-[0.3em] ml-12">
            Ecosistema de Abastecimiento & ACL
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            asChild
            className="bg-prana-emerald text-black hover:bg-prana-emerald/90 font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all hover:scale-105 active:scale-95"
          >
            <Link href="/suppliers/new">
              <Plus className="mr-2 h-4 w-4 stroke-[3]" />
              Agregar Proveedor
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Stats Grid ────────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Total Integraciones',
            value: suppliers.length,
            subtitle: 'Endpoints configurados',
            icon: Settings,
            color: 'text-white',
          },
          {
            title: 'Activos',
            value: activeCount,
            subtitle: 'En funcionamiento',
            icon: CheckCircle,
            color: 'text-prana-emerald',
          },
          {
            title: 'Inactivos',
            value: inactiveCount,
            subtitle: 'Requieren revisión',
            icon: XCircle,
            color: 'text-red-400',
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className="luxury-card-admin p-8 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <ArrowUpRight className="h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors" />
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-black text-white font-mono tracking-tighter">
                {stat.value}
              </p>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                {stat.title}
              </p>
              <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-1">
                {stat.subtitle}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Table ───────────────────────────────────────────────────── */}
      <div className="luxury-card-admin overflow-hidden relative shadow-2xl">
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
        <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-prana-emerald/10 rounded-lg border border-prana-emerald/20">
              <Shield className="h-4 w-4 text-prana-emerald" />
            </div>
            <div>
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">
                Registro de Enlaces
              </h2>
              <h3 className="text-xl font-black text-white tracking-tight">
                Capa de Corrupción (ACL)
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-prana-emerald animate-pulse" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
              Sincronización Activa
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white/[0.01] border-b border-white/5">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-10 py-4">
                  Entidad
                </TableHead>
                <TableHead className="text-[9px] font-black text-gray-500 uppercase tracking-widest py-4">
                  Configuración API
                </TableHead>
                <TableHead className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center py-4">
                  Frecuencia
                </TableHead>
                <TableHead className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center py-4">
                  Estado
                </TableHead>
                <TableHead className="text-[9px] font-black text-gray-500 uppercase tracking-widest py-4">
                  Última Trazabilidad
                </TableHead>
                <TableHead className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-right px-10 py-4">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow
                  key={supplier.id}
                  className="border-b border-white/5 last:border-none hover:bg-white/[0.02] transition-colors group"
                >
                  <TableCell className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-xs font-black text-white group-hover:border-prana-emerald/40 transition-colors">
                        {supplier.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white tracking-tight">{supplier.name}</span>
                        <span className="text-[9px] text-gray-500 font-mono uppercase tracking-tighter">
                          ID: {supplier.id.slice(0, 12)}...
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="flex flex-col gap-1">
                      <code className="text-[10px] text-prana-emerald/80 font-mono bg-prana-emerald/5 px-2 py-0.5 rounded border border-prana-emerald/10 w-fit">
                        {supplier.apiEndpoint}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-6">
                    <Badge
                      variant="outline"
                      className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] font-black uppercase tracking-widest"
                    >
                      <Clock className="mr-1.5 h-3 w-3" />
                      {supplier.syncFrequency}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center py-6">
                    <Badge
                      className={
                        supplier.isActive
                          ? 'bg-prana-emerald/10 text-prana-emerald border-prana-emerald/20 text-[9px] font-black uppercase tracking-widest'
                          : 'bg-red-500/10 text-red-400 border-red-500/20 text-[9px] font-black uppercase tracking-widest'
                      }
                      variant="outline"
                    >
                      {supplier.isActive ? 'Operacional' : 'Suspendido'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-6">
                    <span className="text-[10px] font-mono text-gray-500">
                      {supplier.updatedAt
                        ? new Date(supplier.updatedAt).toLocaleString('es-CL', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'NO_SYNC_DATA'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right px-10 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {suppliers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <Globe className="h-12 w-12 text-white" />
                      <p className="text-xs font-black uppercase tracking-[0.3em]">
                        Cero Nodos Detectados
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
