'use client';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price?: number;
  stock?: number;
  image?: string;
  disabled?: boolean;
}

export interface VariantOption {
  name: string;
  type: 'color' | 'size' | 'text';
  variants: ProductVariant[];
}

interface VariantSelectorProps {
  options: VariantOption[];
  selectedVariants: Record<string, string>;
  onVariantChange: (optionName: string, variantId: string) => void;
  className?: string;
}

export function VariantSelector({
  options,
  selectedVariants,
  onVariantChange,
  className,
}: VariantSelectorProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {options.map((option) => (
        <div key={option.name}>
          <div className="flex items-center justify-between mb-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-prana-gold/60">
              {option.name}
            </label>
            {selectedVariants[option.name] && (
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                Selección:{' '}
                <strong className="text-white">
                  {option.variants.find((v) => v.id === selectedVariants[option.name])?.value}
                </strong>
              </span>
            )}
          </div>

          {option.type === 'color' && (
            <ColorVariants
              variants={option.variants}
              selected={selectedVariants[option.name] || ''}
              onSelect={(id) => onVariantChange(option.name, id)}
            />
          )}

          {option.type === 'size' && (
            <SizeVariants
              variants={option.variants}
              selected={selectedVariants[option.name] || ''}
              onSelect={(id) => onVariantChange(option.name, id)}
            />
          )}

          {option.type === 'text' && (
            <TextVariants
              variants={option.variants}
              selected={selectedVariants[option.name] || ''}
              onSelect={(id) => onVariantChange(option.name, id)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Color Variants Component
function ColorVariants({
  variants,
  selected,
  onSelect,
}: {
  variants: ProductVariant[];
  selected?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {variants.map((variant) => {
        const isSelected = selected === variant.id;
        const isDisabled = variant.disabled || (variant.stock !== undefined && variant.stock === 0);

        return (
          <button
            key={variant.id}
            onClick={() => !isDisabled && onSelect(variant.id)}
            disabled={isDisabled}
            className={cn(
              'relative w-12 h-12 rounded-full border-2 transition-all duration-500',
              isSelected
                ? 'border-prana-gold shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                : 'border-white/10 hover:border-white/30',
              isDisabled && 'opacity-20 cursor-not-allowed',
            )}
            style={{ backgroundColor: variant.value }}
            title={variant.name}
          >
            {isSelected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="w-5 h-5 text-white drop-shadow-lg" strokeWidth={3} />
              </div>
            )}
            {isDisabled && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 bg-gray-400 rotate-45" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Size Variants Component
function SizeVariants({
  variants,
  selected,
  onSelect,
}: {
  variants: ProductVariant[];
  selected?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((variant) => {
        const isSelected = selected === variant.id;
        const isDisabled = variant.disabled || (variant.stock !== undefined && variant.stock === 0);

        return (
          <button
            key={variant.id}
            onClick={() => !isDisabled && onSelect(variant.id)}
            disabled={isDisabled}
            className={cn(
              'px-6 py-4 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500',
              isSelected
                ? 'border-prana-gold bg-prana-gold/10 text-prana-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                : 'border-white/5 bg-white/5 text-white/40 hover:border-white/20 hover:text-white',
              isDisabled && 'opacity-20 cursor-not-allowed line-through',
            )}
          >
            {variant.value}
          </button>
        );
      })}
    </div>
  );
}

// Text Variants Component
function TextVariants({
  variants,
  selected,
  onSelect,
}: {
  variants: ProductVariant[];
  selected?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((variant) => {
        const isSelected = selected === variant.id;
        const isDisabled = variant.disabled || (variant.stock !== undefined && variant.stock === 0);

        return (
          <button
            key={variant.id}
            onClick={() => !isDisabled && onSelect(variant.id)}
            disabled={isDisabled}
            className={cn(
              'px-5 py-3 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500',
              isSelected
                ? 'border-prana-gold bg-prana-gold/10 text-prana-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                : 'border-white/5 bg-white/5 text-white/40 hover:border-white/20 hover:text-white',
              isDisabled && 'opacity-20 cursor-not-allowed',
            )}
          >
            {variant.name}
            {variant.price && <span className="ml-2 text-xs">+${variant.price}</span>}
          </button>
        );
      })}
    </div>
  );
}
