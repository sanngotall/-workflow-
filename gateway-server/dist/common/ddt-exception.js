"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DdtException = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("./error-codes");
class DdtException extends common_1.HttpException {
    constructor(errorCode, message) {
        const errorConfig = error_codes_1.ERROR_CODES[errorCode];
        super({
            success: false,
            data: null,
            error: {
                code: errorConfig.code,
                message: message || errorConfig.message,
            },
        }, errorConfig.status);
    }
}
exports.DdtException = DdtException;
//# sourceMappingURL=ddt-exception.js.map