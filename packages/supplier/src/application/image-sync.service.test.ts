import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ImageSyncService } from './image-sync.service';

describe('ImageSyncService', () => {
  let service: ImageSyncService;

  beforeEach(() => {
    service = new ImageSyncService();
    vi.stubGlobal('fetch', vi.fn());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should sync a single image to Cloudinary', async () => {
    const externalUrl = 'https://example.com/image.jpg';
    const productSlug = 'cool-gadget';

    // Mock download
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    });

    // Mock upload
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        secure_url: 'https://cloudinary.com/image.jpg',
      }),
    });

    const result = await service.syncImageToCloudinary(externalUrl, productSlug, 0);

    expect(result.status).toBe('success');
    expect(result.cloudinaryUrl).toBe('https://cloudinary.com/image.jpg');
    expect(result.publicId).toContain(`products/${productSlug}/0_`);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should handle download failures', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const result = await service.syncImageToCloudinary('https://err.com/404.jpg', 'slug', 0);

    expect(result.status).toBe('error');
    expect(result.error).toContain('Failed to download image: 404');
  });

  it('should handle Cloudinary upload failures', async () => {
    // Mock download success
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    });

    // Mock upload failure
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      text: async () => 'Invalid API Key',
    });

    const result = await service.syncImageToCloudinary('https://ok.com/img.jpg', 'slug', 0);

    expect(result.status).toBe('error');
    expect(result.error).toContain('Cloudinary upload failed: Invalid API Key');
  });

  it('should sync multiple images with delays', async () => {
    const urls = ['url1', 'url2'];

    // Mock download and upload for each URL
    (fetch as any).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
      json: async () => ({ secure_url: 'cld-url' }),
    });

    const syncPromise = service.syncProductImages(urls, 'slug');

    // Advance timers for delay
    await vi.runAllTimersAsync();

    const results = await syncPromise;

    expect(results).toHaveLength(2);
    expect(results[0].status).toBe('success');
    expect(results[1].status).toBe('success');
  });

  it('should delete an image from Cloudinary', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
    });

    await expect(service.deleteImage('sample_id')).resolves.not.toThrow();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/image/destroy'),
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
