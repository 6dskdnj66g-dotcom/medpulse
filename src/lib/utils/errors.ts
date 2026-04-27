/**
 * Typed error classes for the medical query system.
 * Use these instead of throwing generic Error.
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'تجاوزت الحد المسموح. حاول بعد دقيقة.') {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
    this.name = 'RateLimitError';
  }
}

export class ExternalAPIError extends AppError {
  constructor(
    message: string,
    public source: string,
    public originalError?: unknown
  ) {
    super(message, 'EXTERNAL_API_ERROR', 502, { source, originalError });
    this.name = 'ExternalAPIError';
  }
}

export class AIServiceError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'AI_SERVICE_ERROR', 503, originalError);
    this.name = 'AIServiceError';
  }
}

/**
 * Safely extract error message without leaking internals in production.
 */
export function safeErrorMessage(error: unknown, isDev: boolean = false): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (isDev && error instanceof Error) {
    return error.message;
  }
  return 'حدث خطأ أثناء معالجة طلبك';
}