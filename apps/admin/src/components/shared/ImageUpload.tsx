'use client';

import { Loader2, Star, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';

interface ImageUploadProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
}

export function ImageUpload({ value, onChange, multiple = false, maxFiles = 6 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const images = Array.isArray(value) ? value : value ? [value] : [];

  const uploadFile = useCallback(
    async (file: File) => {
      if (images.length >= maxFiles) {
        setError(`Máximo ${maxFiles} imágenes`);
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Tipo no permitido. Usa JPG, PNG, WebP o AVIF.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo excede 5MB');
        return;
      }

      setError('');
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', { method: 'POST', body: formData });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Error al subir');
        }

        const data = await res.json();
        const url = data.url as string;

        if (multiple) {
          onChange([...images, url]);
        } else {
          onChange(url);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al subir imagen');
      } finally {
        setIsUploading(false);
      }
    },
    [images, multiple, maxFiles, onChange],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(uploadFile);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    Array.from(e.dataTransfer.files).forEach(uploadFile);
  };

  const onRemove = (url: string) => {
    if (multiple) {
      onChange(images.filter((img) => img !== url));
    } else {
      onChange('');
    }
  };

  const makeMain = (url: string) => {
    if (!multiple) {
      return;
    }
    const rest = images.filter((img) => img !== url);
    onChange([url, ...rest]);
  };

  return (
    <div className="space-y-3">
      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((url, i) => (
            <div
              key={url}
              className={`group relative overflow-hidden rounded-lg border-2 aspect-square ${
                i === 0 ? 'border-green-500 col-span-2 row-span-2' : 'border-gray-200'
              }`}
            >
              <Image
                src={url}
                alt={`Producto ${i + 1}`}
                fill
                className="object-cover"
                sizes={i === 0 ? '400px' : '200px'}
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {i > 0 && multiple && (
                  <button
                    type="button"
                    onClick={() => makeMain(url)}
                    className="rounded-full bg-white/90 p-1.5 text-amber-600 hover:bg-white"
                    title="Hacer principal"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(url)}
                  className="rounded-full bg-red-500/90 p-1.5 text-white hover:bg-red-600"
                  title="Eliminar"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {i === 0 && images.length > 1 && (
                <span className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      {images.length < maxFiles && (
        <label
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
            dragOver
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 bg-gray-50 hover:border-green-400'
          } ${images.length > 0 ? 'h-28' : 'h-48'}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple={multiple}
            onChange={handleFileInput}
            className="sr-only"
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <span className="text-sm text-gray-500">Subiendo a Cloudinary...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                {images.length === 0 ? 'Arrastra imágenes o haz clic' : 'Agregar más'}
              </p>
              <p className="text-xs text-gray-400">
                JPG, PNG, WebP hasta 5MB · {images.length}/{maxFiles}
              </p>
            </div>
          )}
        </label>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">
          <X className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
