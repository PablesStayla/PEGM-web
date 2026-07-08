type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LoggerConfig {
  module?: string;
  level?: LogLevel;
}

interface Logger {
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
  debug: (message: string, data?: unknown) => void;
}

export function createLogger(config?: LoggerConfig): Logger {
  const module = config?.module || 'app';
  const level = config?.level || 'info';

  const log = (logLevel: LogLevel, message: string, data?: unknown) => {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${logLevel.toUpperCase()}] [${module}]: ${message}`;
    const extra = data !== undefined ? data : '';

    // biome-ignore lint/suspicious/noConsole: native console wrapper
    const logMethods = {
      error: console.error,
      warn: console.warn,
      debug: console.debug,
      info: console.log,
    };

    const method = logMethods[logLevel === 'info' ? 'info' : logLevel] || console.log;
    method(formattedMessage, extra);
  };

  const shouldLog = (logLevel: LogLevel): boolean => {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(logLevel) >= levels.indexOf(level);
  };

  return {
    info: (message, data) => shouldLog('info') && log('info', message, data),
    warn: (message, data) => shouldLog('warn') && log('warn', message, data),
    error: (message, data) => shouldLog('error') && log('error', message, data),
    debug: (message, data) => shouldLog('debug') && log('debug', message, data),
  };
}

export const logger = createLogger();
