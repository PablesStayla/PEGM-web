import { describe, expect, it } from 'vitest';
import type { MovePort } from '../lib/move-reports-logic.js';
import { moveFile, moveReports } from '../lib/move-reports-logic.js';

const mockPort: MovePort = {
  stat: () => ({ isFile: true }),
  exists: () => false,
  rename: () => {},
  mkdir: () => {},
  getMatchingFiles: () => ['report1.md', 'report2.md'],
  cwd: () => '/project',
};

describe('move-reports-logic', () => {
  describe('moveFile', () => {
    it('should move file successfully', () => {
      const result = moveFile(mockPort, '/src/report.md', '/dest/report.md');
      expect(result.success).toBe(true);
    });
    it('should fail for non-file', () => {
      const port = { ...mockPort, stat: () => ({ isFile: false }) };
      const result = moveFile(port, '/src/dir', '/dest/dir');
      expect(result.success).toBe(false);
    });
    it('should backup on collision', () => {
      const port = { ...mockPort, exists: () => true, rename: () => {} };
      const result = moveFile(port, '/src/report.md', '/dest/report.md');
      expect(result.success).toBe(true);
    });
  });

  describe('moveReports', () => {
    it('should move all matching files', () => {
      const results = moveReports(mockPort, '/project', '/project/docs/reports');
      expect(results).toHaveLength(2);
    });
  });
});
