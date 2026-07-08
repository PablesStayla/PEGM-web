import { requireAdmin } from '@pranakaia/infrastructure/auth';
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { createLogger } from '@/lib/logger';

const log = createLogger({ module: 'api:upload' });

const cloudinaryConfig = {
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
};

const isCloudinaryConfigured = Boolean(
  cloudinaryConfig.cloud_name && cloudinaryConfig.api_key && cloudinaryConfig.api_secret,
);

if (isCloudinaryConfigured) {
  cloudinary.config(cloudinaryConfig as any);
}

function ensureCloudinaryConfigured() {
  if (isCloudinaryConfigured) {
    return true;
  }

  log.error('Cloudinary is not configured for admin uploads');
  return false;
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    if (!ensureCloudinaryConfigured()) {
      return NextResponse.json({ error: 'Cloudinary is not configured' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Usa JPG, PNG, WebP o AVIF.' },
        { status: 400 },
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo excede el límite de 5MB' }, { status: 400 });
    }

    // Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise<{
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
      format: string;
      bytes: number;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'pranakaia/products',
            resource_type: 'image',
            transformation: [
              { quality: 'auto:best', fetch_format: 'auto' },
              { width: 1200, height: 1200, crop: 'limit' },
            ],
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error('Upload failed'));
            } else {
              resolve(result);
            }
          },
        )
        .end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al subir imagen' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();

    if (!ensureCloudinaryConfigured()) {
      return NextResponse.json({ error: 'Cloudinary is not configured' }, { status: 500 });
    }

    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json({ error: 'publicId requerido' }, { status: 400 });
    }

    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: 'Error al eliminar imagen' }, { status: 500 });
  }
}
