import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';

/**
 * 全局异常过滤器（对齐 SPEC-04 §1 响应信封：{ success, data, error: { code, message } }）
 *
 * 处理四类异常来源：
 * 1. DdtException：response 形如 { success, data, error: { code, message } }
 *    （error 是对象，直接取 code/message）
 * 2. ValidationPipe / class-validator 抛出的 BadRequestException：response 形如
 *    { statusCode: 400, message: string[], error: 'Bad Request' }
 *    （message 是数组，error 是字符串）→ 统一映射为 INVALID_ARGUMENT，message 取数组 join
 * 3. 其他 HttpException：response 形如 { statusCode, message: string, error: string }
 *    （message 和 error 都是字符串）→ code 用 error 字段，message 用 message 字段
 * 4. PostgreSQL 数据库原生错误（node-postgres）：error 对象含 code 字段（如 '22P02'）
 *    → 按 PG 错误码映射为对应的 DDT 错误码（参数格式类→INVALID_ARGUMENT 400，
 *      唯一约束冲突→BUSINESS_TABLE_NAME_CONFLICT 409，其余→INTERNAL_ERROR 500）
 * 5. 非 HttpException 的原生 Error：统一映射为 INTERNAL_ERROR 500
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_ERROR';
    let errorMessage = '内部服务器错误';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'object' && response !== null) {
        const res = response as Record<string, any>;
        // 1. DdtException：error 字段为对象（含 code/message 子字段）
        if (res.error && typeof res.error === 'object') {
          errorCode = res.error.code ?? errorCode;
          errorMessage = res.error.message ?? errorMessage;
        }
        // 2. ValidationPipe：message 为数组（class-validator 校验失败）
        else if (Array.isArray(res.message) && res.message.length > 0) {
          errorCode = 'INVALID_ARGUMENT';
          errorMessage = res.message.join('; ');
        }
        // 3. 普通 HttpException：message 和 error 均为字符串
        else if (typeof res.message === 'string') {
          errorCode = typeof res.error === 'string' ? res.error : errorCode;
          errorMessage = res.message;
        }
      } else if (typeof response === 'string') {
        errorMessage = response;
      }
    } else if (exception instanceof Error) {
      // 4. PG 数据库原生错误：error.code 为 5 位字符串（如 '22P02'）
      const pgCode = (exception as { code?: string }).code;
      if (pgCode && typeof pgCode === 'string' && /^\d{2}[A-Z]\d{2}$/.test(pgCode)) {
        const mapped = this.mapPostgresError(pgCode, exception.message);
        status = mapped.status;
        errorCode = mapped.code;
        errorMessage = mapped.message;
      } else {
        // 5. 其他原生 Error：保留 message 供排障，code 仍为 INTERNAL_ERROR
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

  /**
   * PostgreSQL 错误码映射（仅覆盖业务层常见错误，对齐 SPEC-04 §6.5 错误码）
   * 完整列表见 https://www.postgresql.org/docs/current/errcodes-appendix.html
   */
  private mapPostgresError(pgCode: string, rawMessage: string): {
    status: number;
    code: string;
    message: string;
  } {
    switch (pgCode) {
      // 类 22：数据异常
      case '22P02': // invalid_text_representation（如无效 UUID 语法）
      case '22P05': // error_in_assignment
        return { status: 400, code: 'INVALID_ARGUMENT', message: '参数格式非法：' + rawMessage };
      case '22001': // string_data_right_truncation（字符串超长）
        return { status: 400, code: 'INVALID_ARGUMENT', message: '字段值长度超限：' + rawMessage };
      case '22003': // numeric_value_out_of_range
        return { status: 400, code: 'INVALID_ARGUMENT', message: '数值超出范围：' + rawMessage };
      case '22007': // invalid_datetime_format
        return { status: 400, code: 'FIELD_TYPE_MISMATCH', message: '时间格式非法：' + rawMessage };

      // 类 23：完整性约束违反
      case '23502': // not_null_violation
        return { status: 400, code: 'INVALID_ARGUMENT', message: '字段不可为空：' + rawMessage };
      case '23503': // foreign_key_violation
        return { status: 400, code: 'INVALID_ARGUMENT', message: '关联记录不存在：' + rawMessage };
      case '23505': // unique_violation
        return { status: 409, code: 'BUSINESS_TABLE_NAME_CONFLICT', message: '名称冲突：' + rawMessage };
      case '23514': // check_violation
        return { status: 400, code: 'INVALID_ARGUMENT', message: '字段值不满足约束：' + rawMessage };

      // 类 42：语法错误或访问规则违反
      case '42P01': // undefined_table
        return { status: 404, code: 'BUSINESS_TABLE_NOT_FOUND', message: '业务表不存在：' + rawMessage };
      case '42703': // undefined_column
        return { status: 400, code: 'INVALID_ARGUMENT', message: '字段不存在：' + rawMessage };

      // 其余 PG 错误码统一为 500
      default:
        return { status: 500, code: 'INTERNAL_ERROR', message: rawMessage };
    }
  }
}
