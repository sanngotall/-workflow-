import { HttpException } from '@nestjs/common';
import { ErrorCode } from './error-codes';
export declare class DdtException extends HttpException {
    constructor(errorCode: ErrorCode, message?: string);
}
