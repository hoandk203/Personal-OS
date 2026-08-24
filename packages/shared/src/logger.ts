export interface ILogger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}

export class ConsoleLogger implements ILogger {
  constructor(private readonly serviceName = 'PersonalOS') {}

  info(message: string, context?: Record<string, unknown>): void {
    console.log(JSON.stringify({ level: 'info', service: this.serviceName, message, context, timestamp: new Date().toISOString() }));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(JSON.stringify({ level: 'warn', service: this.serviceName, message, context, timestamp: new Date().toISOString() }));
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errorDetails = error instanceof Error ? { message: error.message, stack: error.stack } : { raw: error };
    console.error(JSON.stringify({ level: 'error', service: this.serviceName, message, error: errorDetails, context, timestamp: new Date().toISOString() }));
  }

  debug(message: string, context?: Record<string, unknown>): void {
    console.debug(JSON.stringify({ level: 'debug', service: this.serviceName, message, context, timestamp: new Date().toISOString() }));
  }
}

export class SilentLogger implements ILogger {
  info(_message: string, _context?: Record<string, unknown>): void {}
  warn(_message: string, _context?: Record<string, unknown>): void {}
  error(_message: string, _error?: Error | unknown, _context?: Record<string, unknown>): void {}
  debug(_message: string, _context?: Record<string, unknown>): void {}
}
