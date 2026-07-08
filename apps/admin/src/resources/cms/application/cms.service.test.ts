import { db, withRLS } from '@pranakaia/infrastructure/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CmsService } from './cms.service';

vi.mock('@pranakaia/infrastructure/db', () => ({
  db: { select: vi.fn() },
  withRLS: vi.fn(),
  cmsPages: { id: 'id', title: 'title', slug: 'slug' },
}));

describe('CmsService', () => {
  let service: CmsService;

  beforeEach(() => {
    service = new CmsService();
    vi.clearAllMocks();
  });

  it('debe listar todas las páginas', async () => {
    const mockPages = [{ id: '1', title: 'Home' }];
    (db.select as any).mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue(mockPages),
      }),
    });

    const result = await service.getPages();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual(mockPages);
    }
  });

  it('debe crear una nueva página', async () => {
    const pageData = { slug: 'test', title: 'Test', content: '...', status: 'DRAFT' as const };
    (withRLS as any).mockImplementation(async (_uid: any, _role: any, cb: any) => {
      return cb({
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue(true),
        }),
      });
    });

    const result = await service.upsertPage(null, pageData, 'admin-1');
    expect(result.success).toBe(true);
  });
});
