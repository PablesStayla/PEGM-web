'use client';

import { Button } from '@pranakaia/ui';
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useProductStore } from '@/store';

interface FilterSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

const categories = [
  { id: 'devices', label: 'Iluminación', count: 12 },
  { id: 'accessories', label: 'Accesorios', count: 28 },
  { id: 'bundles', label: 'Paquetes', count: 5 },
];

const priceRanges = [
  { id: 'under-100', label: 'Menos de $100', min: 0, max: 100 },
  { id: '100-250', label: '$100 - $250', min: 100, max: 250 },
  { id: '250-500', label: '$250 - $500', min: 250, max: 500 },
  { id: 'over-500', label: 'Más de $500', min: 500, max: 999999 },
];

const tags = [
  'Portátil',
  'Premium',
  'Principiante',
  'Profesional',
  'Recargable',
  'Garantía',
  'Nuevo',
  'Oferta',
];

export function FilterSidebar({ isOpen = true, onClose, className }: FilterSidebarProps) {
  const { currentCategory, filterByCategory, products } = useProductStore();
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    tags: true,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryChange = (category: string) => {
    filterByCategory(category);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const clearAllFilters = () => {
    filterByCategory('all');
    setSelectedTags([]);
    setPriceRange([0, 1000]);
  };

  const hasActiveFilters = currentCategory !== 'all' || selectedTags.length > 0;

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 h-full overflow-y-auto',
        'transition-all duration-300',
        !isOpen && 'hidden lg:block',
        className,
      )}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
              aria-label="Cerrar filtros"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <button
              onClick={clearAllFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <button
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full mb-4"
          >
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Categoría
            </h3>
            {expandedSections.category ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {expandedSections.category && (
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="category"
                    checked={currentCategory === null}
                    onChange={() => handleCategoryChange('all')}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">Todos</span>
                </div>
                <span className="text-xs text-gray-500">{products.length}</span>
              </label>

              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="category"
                      checked={currentCategory === category.id}
                      onChange={() => handleCategoryChange(category.id)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      {category.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{category.count}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full mb-4"
          >
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Precio</h3>
            {expandedSections.price ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {expandedSections.price && (
            <div className="space-y-3">
              {priceRanges.map((range) => (
                <label key={range.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    {range.label}
                  </span>
                </label>
              ))}

              {/* Custom Price Range Slider */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">${priceRange[0]}</span>
                  <span className="text-sm text-gray-600">${priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Number.parseInt(e.target.value, 10)])
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tags Filter */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('tags')}
            className="flex items-center justify-between w-full mb-4"
          >
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Características
            </h3>
            {expandedSections.tags ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {expandedSections.tags && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    selectedTags.includes(tag)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Apply Button (Mobile) */}
        <div className="lg:hidden">
          <Button onClick={onClose} className="w-full" size="lg">
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </aside>
  );
}
