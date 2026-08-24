import { describe, it, expect } from 'vitest';
import { ok, fail, AppError, DomainError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError, ConsoleLogger, SilentLogger } from '@personal-os/shared';

describe('Shared Utilities & Errors Suite', () => {
  describe('Result Monad', () => {
    it('should handle Success mapping and unwrapping', () => {
      const result = ok(10);
      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.unwrap()).toBe(10);
      expect(result.unwrapOr(0)).toBe(10);

      const mapped = result.map(n => n * 2);
      expect(mapped.unwrap()).toBe(20);

      const flatMapped = result.flatMap(n => ok(`Value is ${n}`));
      expect(flatMapped.unwrap()).toBe('Value is 10');
    });

    it('should handle Failure mapping and unwrapping', () => {
      const failure = fail(new Error('Operation failed'));
      expect(failure.isSuccess).toBe(false);
      expect(failure.isFailure).toBe(true);
      expect(failure.unwrapOr(99)).toBe(99);

      expect(() => failure.unwrap()).toThrow('Operation failed');

      const mapped = failure.map((n: number) => n * 2);
      expect(mapped.isFailure).toBe(true);

      const flatMapped = failure.flatMap((n: number) => ok(n));
      expect(flatMapped.isFailure).toBe(true);
    });
  });

  describe('Error Hierarchy', () => {
    it('should initialize error types with correct status codes', () => {
      const appErr = new AppError('App error', 500);
      expect(appErr.statusCode).toBe(500);

      const domainErr = new DomainError('Domain error');
      expect(domainErr.statusCode).toBe(400);

      const valErr = new ValidationError('Invalid input');
      expect(valErr.statusCode).toBe(422);

      const notFoundErr = new NotFoundError('Task', 't-1');
      expect(notFoundErr.statusCode).toBe(404);
      expect(notFoundErr.message).toContain('t-1');

      const notFoundNoId = new NotFoundError('Task');
      expect(notFoundNoId.message).toBe('Task not found');

      const unauthErr = new UnauthorizedError();
      expect(unauthErr.statusCode).toBe(401);

      const forbErr = new ForbiddenError();
      expect(forbErr.statusCode).toBe(403);

      const conflictErr = new ConflictError('Duplicate');
      expect(conflictErr.statusCode).toBe(409);
    });
  });

  describe('Loggers', () => {
    it('should run without throwing exceptions', () => {
      const consoleLogger = new ConsoleLogger('TestService');
      consoleLogger.info('info message');
      consoleLogger.warn('warn message');
      consoleLogger.error('error message', new Error('test err'));
      consoleLogger.error('error message raw', 'string error');
      consoleLogger.debug('debug message');

      const silentLogger = new SilentLogger();
      silentLogger.info('info');
      silentLogger.warn('warn');
      silentLogger.error('error');
      silentLogger.debug('debug');
    });
  });
});
