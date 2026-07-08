import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCli, logger } from './create-cli.js';

describe('createCli', () => {
  const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
    throw new Error('process.exit');
  });
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    exitSpy.mockClear();
    errorSpy.mockClear();
  });

  it('should create a Command instance with correct name and version', () => {
    const cli = createCli({
      name: 'test-tool',
      version: '1.0.0',
      description: 'A test tool',
      action: async () => {},
    });

    expect(cli.name()).toBe('test-tool');
    expect(cli.version()).toBe('1.0.0');
  });

  it('should set description on the program', () => {
    const cli = createCli({
      name: 'my-tool',
      version: '2.0.0',
      description: 'My description',
      action: async () => {},
    });

    expect(cli.description()).toBe('My description');
  });

  it('should add custom options when provided', async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    const cli = createCli({
      name: 'opt-test',
      version: '1.0.0',
      description: 'Options test',
      action,
      options: [{ flags: '--count <n>', description: 'A count', defaultValue: '5' }],
    });

    await cli.parseAsync(['node', 'opt-test', '--count', '10']);

    expect(action).toHaveBeenCalledWith(expect.objectContaining({ count: '10' }));
  });

  it('should include default --verbose, --dry-run, --json options', async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    const cli = createCli({
      name: 'default-opts',
      version: '1.0.0',
      description: 'Default options',
      action,
    });

    await cli.parseAsync(['node', 'default-opts', '--verbose', '--json']);

    expect(action).toHaveBeenCalledWith(
      expect.objectContaining({ verbose: true, json: true, dryRun: false }),
    );
  });

  it('should call process.exit(1) on action error', async () => {
    const cli = createCli({
      name: 'err-tool',
      version: '1.0.0',
      description: 'Error test',
      action: async () => {
        throw new Error('boom');
      },
    });

    try {
      await cli.parseAsync(['node', 'err-tool']);
    } catch {
      // process.exit mock throws
    }

    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('should output JSON error when --json is set and action fails', async () => {
    const cli = createCli({
      name: 'json-err',
      version: '1.0.0',
      description: 'JSON error test',
      action: async () => {
        throw new Error('json-boom');
      },
    });

    try {
      await cli.parseAsync(['node', 'json-err', '--json']);
    } catch {
      // process.exit mock throws
    }

    expect(errorSpy).toHaveBeenCalledWith(JSON.stringify({ error: 'json-boom' }, null, 2));
  });
});

describe('logger', () => {
  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  beforeEach(() => {
    logSpy.mockClear();
    errSpy.mockClear();
    warnSpy.mockClear();
  });

  it('should log success with check mark', () => {
    logger.success('done');
    expect(logSpy).toHaveBeenCalled();
    const output = logSpy.mock.calls[0][0];
    expect(output).toContain('done');
  });

  it('should log error with cross mark', () => {
    logger.error('fail');
    expect(errSpy).toHaveBeenCalled();
    const output = errSpy.mock.calls[0][0];
    expect(output).toContain('fail');
  });

  it('should log warning with warning symbol', () => {
    logger.warning('caution');
    expect(warnSpy).toHaveBeenCalled();
    const output = warnSpy.mock.calls[0][0];
    expect(output).toContain('caution');
  });

  it('should log info with info symbol', () => {
    logger.info('note');
    expect(logSpy).toHaveBeenCalled();
    const output = logSpy.mock.calls[0][0];
    expect(output).toContain('note');
  });

  it('should log step with chevron', () => {
    logger.step('processing');
    expect(logSpy).toHaveBeenCalled();
    const output = logSpy.mock.calls[0][0];
    expect(output).toContain('processing');
  });

  it('should output JSON data', () => {
    logger.json({ key: 'value' });
    expect(logSpy).toHaveBeenCalledWith(JSON.stringify({ key: 'value' }, null, 2));
  });
});
