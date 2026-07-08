'use client';

import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@pranakaia/ui';
import { Search } from 'lucide-react';
import { useQueryState } from 'nuqs';

export function ProductsFilters() {
  const [search, setSearch] = useQueryState('search', {
    shallow: false,
    throttleMs: 500,
    defaultValue: '',
  });
  const [category, setCategory] = useQueryState('category', {
    shallow: false,
    defaultValue: 'all',
  });
  const [active, setActive] = useQueryState('active', { shallow: false, defaultValue: 'all' });

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/6 bg-[#161616] p-4">
      {/* Search */}
      <div className="relative flex-1 min-w-50">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Buscar productos..."
          className="pl-10 bg-white/4 border-white/10 text-white placeholder-gray-500 focus:border-[#14b8a6]/40 h-10"
          value={search}
          onChange={(e) => setSearch(e.target.value || null)}
        />
      </div>

      {/* Category Filter */}
      <Select
        value={category}
        onValueChange={(value) => setCategory(value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-45 bg-white/4 border-white/10 text-gray-300 focus:border-[#14b8a6]/40 h-10">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a1a] border-white/8 text-white">
          <SelectItem value="all">Todas las categorías</SelectItem>
          <SelectItem value="vaporizers">Vaporizadores</SelectItem>
          <SelectItem value="accessories">Accesorios</SelectItem>
          <SelectItem value="parts">Repuestos</SelectItem>
          <SelectItem value="bundles">Packs</SelectItem>
        </SelectContent>
      </Select>

      {/* Active Filter */}
      <Select value={active} onValueChange={(value) => setActive(value === 'all' ? null : value)}>
        <SelectTrigger className="w-40 bg-white/4 border-white/10 text-gray-300 focus:border-[#14b8a6]/40 h-10">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a1a] border-white/8 text-white">
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="true">Activos</SelectItem>
          <SelectItem value="false">Inactivos</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
