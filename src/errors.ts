import { SynthesiaError } from './types';

export class SynthesiaSDKError extends Error {
  public readonly code?: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(error: SynthesiaError) {
    super(error.message);
    this.name = 'SynthesiaSDKError';
    this.code = error.code;
    this.statusCode = error.statusCode;
    this.details = error.details;
  }

  static fromResponse(error: SynthesiaError): SynthesiaSDKError {
    return new SynthesiaSDKError(error);
  }

  isRateLimited(): boolean {
    return this.statusCode === 429;
  }

  isAuthenticationError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }

  isValidationError(): boolean {
    return this.statusCode === 400;
  }

  isNotFound(): boolean {
    return this.statusCode === 404;
  }

  isServerError(): boolean {
    return this.statusCode >= 500;
  }
}

export class ValidationError extends SynthesiaSDKError {
  constructor(message: string, details?: any) {
    super({
      message,
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details,
    });
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends SynthesiaSDKError {
  constructor(message: string = 'Authentication failed') {
    super({
      message,
      statusCode: 401,
      code: 'AUTHENTICATION_ERROR',
    });
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends SynthesiaSDKError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super({
      message,
      statusCode: 429,
      code: 'RATE_LIMIT_ERROR',
    });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class NotFoundError extends SynthesiaSDKError {
  constructor(resource: string, id: string) {
    super({
      message: `${resource} with ID '${id}' not found`,
      statusCode: 404,
      code: 'NOT_FOUND',
    });
    this.name = 'NotFoundError';
  }
}

export class ServerError extends SynthesiaSDKError {
  constructor(message: string = 'Internal server error') {
    super({
      message,
      statusCode: 500,
      code: 'SERVER_ERROR',
    });
    this.name = 'ServerError';
  }
}