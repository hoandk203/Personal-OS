export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code: string = 'INTERNAL_ERROR',
    public readonly details?: Record<string, string[] | string>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class DomainError extends AppError {
  constructor(message: string, code = 'DOMAIN_RULE_VIOLATION', details?: Record<string, string[] | string>) {
    super(message, 400, code, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, string[] | string>) {
    super(message, 422, 'VALIDATION_FAILED', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id '${id}' not found` : `${resource} not found`,
      404,
      'NOT_FOUND'
    );
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden action') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}
