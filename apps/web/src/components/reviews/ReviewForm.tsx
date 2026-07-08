'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@pranakaia/ui';
import { Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { startTransition, useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { StarRating } from './StarRating';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Por favor selecciona una calificación').max(5),
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  comment: z.string().min(20, 'El comentario debe tener al menos 20 caracteres'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: string;
  onSubmit: (data: ReviewFormData & { images?: string[]; productId: string }) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export function ReviewForm({ productId, onSubmit, onCancel, className }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      title: '',
      comment: '',
    },
  });

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setValue('rating', newRating);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((file) => URL.createObjectURL(file));
    setImages([...images, ...urls]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Wrapper for server action
  const executeSubmit = async (_prevState: unknown, formData: FormData) => {
    const data = {
      rating: Number(formData.get('rating')),
      title: formData.get('title') as string,
      comment: formData.get('comment') as string,
    };

    await onSubmit({ ...data, images, productId });
    return { success: true };
  };

  const [state, formAction] = useFormState(executeSubmit, null);

  // Hook-form to native formdata bridge
  const onSubmitForm = (data: ReviewFormData) => {
    startTransition(() => {
      const fd = new FormData();
      fd.append('rating', data.rating.toString());
      fd.append('title', data.title);
      fd.append('comment', data.comment);
      formAction(fd);
    });
  };

  useEffect(() => {
    if (state?.success && onCancel) {
      onCancel(); // cierra formulario al enviar
    }
  }, [state, onCancel]);

  return (
    <form
      action={() => handleSubmit(onSubmitForm)()}
      className={cn(
        'space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm',
        className,
      )}
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Escribe una reseña</h3>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Calificación *</label>
          <StarRating rating={rating} onRatingChange={handleRatingChange} size="lg" />
          {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Título de la reseña *
          </label>
          <input
            type="text"
            id="title"
            {...register('title')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transiton-all"
            placeholder="Resume tu experiencia"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Tu reseña *
          </label>
          <textarea
            id="comment"
            {...register('comment')}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all"
            placeholder="Comparte tus pensamientos sobre el producto..."
          />
          {errors.comment && <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agregar fotos (opcional)
          </label>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={image}
                    alt={`Upload ${index + 1}`}
                    width={80}
                    height={80}
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {images.length < 5 && (
            <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">Subir imágenes (máx. 5)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="default"
      disabled={pending}
      className="min-w-35 bg-green-700 hover:bg-green-800 transition-colors"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Enviando...
        </span>
      ) : (
        'Publicar reseña'
      )}
    </Button>
  );
}
