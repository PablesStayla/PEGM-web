import { createHash } from 'node:crypto';
import { env } from '../infrastructure/env';

export interface ImageSyncResult {
  originalUrl: string;
  cloudinaryUrl: string;
  publicId: string;
  status: 'success' | 'error';
  error?: string;
}

export class ImageSyncService {
  private cloudinaryCloudName: string;
  private cloudinaryApiKey: string;
  private cloudinaryApiSecret: string;

  constructor() {
    this.cloudinaryCloudName = env.CLOUDINARY_CLOUD_NAME || '';
    this.cloudinaryApiKey = env.CLOUDINARY_API_KEY || '';
    this.cloudinaryApiSecret = env.CLOUDINARY_API_SECRET || '';
  }

  /**
   * Descarga imagen de URL externa y la sube a Cloudinary
   */
  async syncImageToCloudinary(
    externalImageUrl: string,
    productSlug: string,
    index: number,
  ): Promise<ImageSyncResult> {
    try {
      // 1. Generar public_id único
      const hash = createHash('md5').update(externalImageUrl).digest('hex').slice(0, 8);
      const publicId = `products/${productSlug}/${index}_${hash}`;

      // 2. Descargar imagen del proveedor
      const imageBuffer = await this.downloadImage(externalImageUrl);

      // 3. Subir a Cloudinary
      const cloudinaryUrl = await this.uploadToCloudinary(imageBuffer, publicId, externalImageUrl);

      return {
        originalUrl: externalImageUrl,
        cloudinaryUrl,
        publicId,
        status: 'success',
      };
    } catch (error) {
      return {
        originalUrl: externalImageUrl,
        cloudinaryUrl: '',
        publicId: '',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sincroniza múltiples imágenes de un producto
   */
  async syncProductImages(
    externalImageUrls: string[],
    productSlug: string,
  ): Promise<ImageSyncResult[]> {
    const results: ImageSyncResult[] = [];

    for (let i = 0; i < externalImageUrls.length; i++) {
      const result = await this.syncImageToCloudinary(externalImageUrls[i]!, productSlug, i);
      results.push(result);

      // Delay para no sobrecargar Cloudinary
      if (i < externalImageUrls.length - 1) {
        await this.delay(500);
      }
    }

    return results;
  }

  /**
   * Descarga imagen desde URL externa
   */
  private async downloadImage(url: string): Promise<Buffer> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Sube imagen a Cloudinary
   */
  private async uploadToCloudinary(
    imageBuffer: Buffer,
    publicId: string,
    originalUrl: string,
  ): Promise<string> {
    // Generar signature
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = this.generateCloudinarySignature(publicId, timestamp);

    // Crear FormData
    const formData = new FormData();
    formData.append('file', new Blob([new Uint8Array(imageBuffer)]));
    formData.append('api_key', this.cloudinaryApiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('public_id', publicId);
    formData.append('signature', signature);
    formData.append('folder', 'products');
    formData.append('overwrite', 'true');
    formData.append('source', originalUrl); // Metadata

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudinaryCloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudinary upload failed: ${error}`);
    }

    const data = await response.json();
    return data.secure_url;
  }

  /**
   * Genera signature para Cloudinary
   */
  private generateCloudinarySignature(publicId: string, timestamp: number): string {
    const stringToSign = `folder=products&overwrite=true&public_id=${publicId}&timestamp=${timestamp}${this.cloudinaryApiSecret}`;
    return createHash('sha256').update(stringToSign).digest('hex');
  }

  /**
   * Elimina imagen de Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = this.generateCloudinarySignature(publicId, timestamp);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudinaryCloudName}/image/destroy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_id: publicId,
          api_key: this.cloudinaryApiKey,
          timestamp,
          signature,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to delete image: ${await response.text()}`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
