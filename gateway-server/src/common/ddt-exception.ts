import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_CODES, ErrorCode } from './error-codes';

export class DdtException extends HttpException {
  constructor(errorCode: ErrorCode, message?: string) {
    const errorConfig = ERROR_CODES[errorCode];
    super(
      {
        success: false,
        data: null,
        error: {
          code: errorConfig.code,
          message: message || errorConfig.message,
        },
      },
      errorConfig.status,
    );
  }
}
