import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import {
  LlmParseError,
  LlmUnavailableError,
  LlmValidationError,
} from '@/core/errors';
import {
  GlobalExceptionFilter,
  MESSAGE_INTERNAL_ERROR,
  MESSAGE_LLM_PARSE_ERROR,
  MESSAGE_LLM_UNAVAILABLE,
  MESSAGE_LLM_VALIDATION_FAILED,
} from '@/core/filters/global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let host: ArgumentsHost;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    host = {
      switchToHttp: () => ({
        getResponse: () => ({ status: statusMock }),
        getRequest: () => ({ method: 'POST', url: '/api/reports' }),
      }),
    } as unknown as ArgumentsHost;
  });

  it('should return 503 for LlmUnavailableError', () => {
    // Arrange
    const exception = new LlmUnavailableError();

    // Act
    filter.catch(exception, host);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: MESSAGE_LLM_UNAVAILABLE }),
    );
  });

  it('should return 422 for LlmValidationError', () => {
    // Arrange
    const exception = new LlmValidationError([]);

    // Act
    filter.catch(exception, host);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: MESSAGE_LLM_VALIDATION_FAILED }),
    );
  });

  it('should return 422 for LlmParseError', () => {
    // Arrange
    const exception = new LlmParseError('bad response');

    // Act
    filter.catch(exception, host);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: MESSAGE_LLM_PARSE_ERROR }),
    );
  });

  it('should return 500 for unknown errors', () => {
    // Arrange
    const exception = new Error('something unexpected');

    // Act
    filter.catch(exception, host);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: MESSAGE_INTERNAL_ERROR }),
    );
  });

  it('should pass through HttpException status and message', () => {
    // Arrange
    const exception = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);

    // Act
    filter.catch(exception, host);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Bad Request' }),
    );
  });

  it('should normalize HttpException message array to comma-separated string', () => {
    // Arrange — NestJS ValidationPipe returns { message: string[] }
    const exception = new HttpException(
      {
        message: ['title must be a string', 'description should not be empty'],
      },
      HttpStatus.BAD_REQUEST,
    );

    // Act
    filter.catch(exception, host);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'title must be a string, description should not be empty',
      }),
    );
  });
});
