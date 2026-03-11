import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  LlmParseError,
  LlmUnavailableError,
  LlmValidationError,
} from '@/core/errors';

export const MESSAGE_LLM_UNAVAILABLE = 'AI service temporarily unavailable';
export const MESSAGE_LLM_VALIDATION_FAILED = 'AI response validation failed';
export const MESSAGE_LLM_PARSE_ERROR = 'AI response format error';
export const MESSAGE_INTERNAL_ERROR = 'Internal server error';

const LLM_ERROR_RESPONSES = {
  LlmUnavailableError: {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: MESSAGE_LLM_UNAVAILABLE,
  },
  LlmValidationError: {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    message: MESSAGE_LLM_VALIDATION_FAILED,
  },
  LlmParseError: {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    message: MESSAGE_LLM_PARSE_ERROR,
  },
} as const;

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message } = this.resolve(exception);

    if (this.isServerError(status)) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private resolve(exception: unknown): { status: number; message: string } {
    if (exception instanceof HttpException)
      return this.resolveHttpException(exception);
    if (exception instanceof LlmUnavailableError)
      return LLM_ERROR_RESPONSES.LlmUnavailableError;
    if (exception instanceof LlmValidationError)
      return LLM_ERROR_RESPONSES.LlmValidationError;
    if (exception instanceof LlmParseError)
      return LLM_ERROR_RESPONSES.LlmParseError;
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: MESSAGE_INTERNAL_ERROR,
    };
  }

  private resolveHttpException(exception: HttpException): {
    status: number;
    message: string;
  } {
    const exceptionResponse = exception.getResponse();
    const rawMessage = this.extractMessage(
      exceptionResponse,
      exception.message,
    );
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(', ')
      : rawMessage;
    return { status: exception.getStatus(), message };
  }

  private extractMessage(
    exceptionResponse: string | object,
    fallback: string,
  ): string | string[] {
    if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      return (exceptionResponse as { message: string | string[] }).message;
    }
    return fallback;
  }

  private isServerError(status: number): boolean {
    return status >= (HttpStatus.INTERNAL_SERVER_ERROR as number);
  }
}
