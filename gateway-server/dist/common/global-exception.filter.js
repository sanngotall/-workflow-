"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let GlobalExceptionFilter = class GlobalExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const reply = ctx.getResponse();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let errorCode = 'INTERNAL_ERROR';
        let errorMessage = '内部服务器错误';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const response = exception.getResponse();
            if (typeof response === 'object' && response !== null) {
                const res = response;
                if (res.error && typeof res.error === 'object') {
                    errorCode = res.error.code ?? errorCode;
                    errorMessage = res.error.message ?? errorMessage;
                }
                else if (Array.isArray(res.message) && res.message.length > 0) {
                    errorCode = 'INVALID_ARGUMENT';
                    errorMessage = res.message.join('; ');
                }
                else if (typeof res.message === 'string') {
                    errorCode = typeof res.error === 'string' ? res.error : errorCode;
                    errorMessage = res.message;
                }
            }
            else if (typeof response === 'string') {
                errorMessage = response;
            }
        }
        else if (exception instanceof Error) {
            const pgCode = exception.code;
            if (pgCode && typeof pgCode === 'string' && /^\d{2}[A-Z]\d{2}$/.test(pgCode)) {
                const mapped = this.mapPostgresError(pgCode, exception.message);
                status = mapped.status;
                errorCode = mapped.code;
                errorMessage = mapped.message;
            }
            else {
                errorMessage = exception.message || errorMessage;
            }
        }
        reply.status(status).send({
            success: false,
            data: null,
            error: {
                code: errorCode,
                message: errorMessage,
            },
        });
    }
    mapPostgresError(pgCode, rawMessage) {
        switch (pgCode) {
            case '22P02':
            case '22P05':
                return { status: 400, code: 'INVALID_ARGUMENT', message: '参数格式非法：' + rawMessage };
            case '22001':
                return { status: 400, code: 'INVALID_ARGUMENT', message: '字段值长度超限：' + rawMessage };
            case '22003':
                return { status: 400, code: 'INVALID_ARGUMENT', message: '数值超出范围：' + rawMessage };
            case '22007':
                return { status: 400, code: 'FIELD_TYPE_MISMATCH', message: '时间格式非法：' + rawMessage };
            case '23502':
                return { status: 400, code: 'INVALID_ARGUMENT', message: '字段不可为空：' + rawMessage };
            case '23503':
                return { status: 400, code: 'INVALID_ARGUMENT', message: '关联记录不存在：' + rawMessage };
            case '23505':
                return { status: 409, code: 'BUSINESS_TABLE_NAME_CONFLICT', message: '名称冲突：' + rawMessage };
            case '23514':
                return { status: 400, code: 'INVALID_ARGUMENT', message: '字段值不满足约束：' + rawMessage };
            case '42P01':
                return { status: 404, code: 'BUSINESS_TABLE_NOT_FOUND', message: '业务表不存在：' + rawMessage };
            case '42703':
                return { status: 400, code: 'INVALID_ARGUMENT', message: '字段不存在：' + rawMessage };
            default:
                return { status: 500, code: 'INTERNAL_ERROR', message: rawMessage };
        }
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map