'use client';

import { Badge, Card, Input } from '@pranakaia/ui';
import { Filter, Mail, MoreHorizontal, Search, ShoppingBag, Users } from 'lucide-react';

interface CustomerListProps {
  customers: any[];
  total: number;
  query: string;
}

function fmtDate(d: Date | string | null) {
  if (!d) {
    return '-';
  }
  return new Date(d).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);
}

export function CustomerList({ customers, total, query }: CustomerListProps) {
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrders = customers.reduce((sum, c) => sum + c._count.orders, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Clientes</h1>
          <p className="text-sm text-gray-400 mt-1">
            {total} clientes registrados (Screaming Architecture)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors">
            <Filter className="h-4 w-4" />
            Filtrar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-5 bg-[#161616] border-white/6 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4 relative">
            <div className="rounded-xl bg-blue-500/10 p-3">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{total}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Clientes
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-[#161616] border-white/6 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4 relative">
            <div className="rounded-xl bg-green-500/10 p-3">
              <ShoppingBag className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalOrders}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Órdenes
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-[#161616] border-white/6 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#14b8a6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4 relative">
            <div className="rounded-xl bg-[#14b8a6]/10 p-3">
              <Mail className="h-6 w-6 text-[#14b8a6]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{fmtMoney(totalRevenue)}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ingresos (Segmento)
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <form className="max-w-md" method="GET">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 group-focus-within:text-[#14b8a6] transition-colors" />
          <Input
            name="q"
            placeholder="Buscar por nombre o email..."
            defaultValue={query}
            className="pl-11 bg-[#161616] border-white/10 hover:border-white/20 focus:border-[#14b8a6]/50 transition-all rounded-xl h-11 text-sm"
            aria-label="Buscar clientes"
          />
        </div>
      </form>

      {/* Table */}
      <div className="rounded-xl border border-white/6 bg-[#161616] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Tabla de clientes">
            <thead>
              <tr className="border-b border-white/6 bg-white/[0.02] text-left">
                <th
                  scope="col"
                  className="px-6 py-4 font-semibold text-gray-400 uppercase tracking-wider text-[10px]"
                >
                  Cliente
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 font-semibold text-gray-400 uppercase tracking-wider text-[10px]"
                >
                  Contacto
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 font-semibold text-gray-400 uppercase tracking-wider text-[10px] text-center"
                >
                  Órdenes
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 font-semibold text-gray-400 uppercase tracking-wider text-[10px] text-right"
                >
                  Gasto Total
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 font-semibold text-gray-400 uppercase tracking-wider text-[10px] text-right"
                >
                  Registrado
                </th>
                <th scope="col" className="px-6 py-4 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 opacity-20" />
                      <p>
                        {query
                          ? 'No se encontraron clientes con esa búsqueda'
                          : 'No hay clientes registrados aún'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => {
                  return (
                    <tr key={customer.id} className="hover:bg-white/2 transition-colors group">
                      <td className="px-6 py-4 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/20 flex items-center justify-center text-[10px] font-bold text-[#14b8a6]">
                            {(customer.firstName?.[0] ?? '') + (customer.lastName?.[0] ?? '')}
                          </div>
                          <span className="text-white">
                            {customer.firstName} {customer.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-gray-300">{customer.email}</span>
                          <span className="text-[10px] text-gray-500">
                            {customer.phone ?? 'Sin teléfono'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge className="bg-white/5 border-white/10 text-gray-300">
                          {customer._count.orders}{' '}
                          {customer._count.orders === 1 ? 'orden' : 'órdenes'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-[#14b8a6]">
                          {fmtMoney(customer.totalSpent)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500 whitespace-nowrap">
                        {fmtDate(customer.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
