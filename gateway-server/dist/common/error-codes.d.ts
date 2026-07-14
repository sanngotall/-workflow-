export declare const ERROR_CODES: {
    INVALID_ARGUMENT: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    UNAUTHENTICATED: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    FORBIDDEN: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    PROJECT_NOT_FOUND: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    USER_NOT_FOUND: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    USER_DISABLED: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    INVALID_CREDENTIALS: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    TOKEN_EXPIRED: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    TOKEN_INVALID: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    MEMBER_ALREADY_EXISTS: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    MEMBER_NOT_FOUND: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    LAST_ADMIN_LOCKED: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    ROLE_INVALID: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    USERNAME_EXISTS: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    EMAIL_EXISTS: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    PASSWORD_TOO_WEAK: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    ADMIN_IMMUTABLE: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    ROUTE_NOT_FOUND: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    RESOURCE_EXHAUSTED: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    QUEUE_FULL: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    QUEUE_DEAD: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    TARGET_TIMEOUT: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    TARGET_CIRCUIT_BROKEN: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    TARGET_SERVER_ERROR: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    BUSINESS_TABLE_NOT_FOUND: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    BUSINESS_TABLE_NAME_CONFLICT: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    FIELD_TYPE_MISMATCH: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    PRIMARY_KEY_IMMUTABLE: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    CACHE_TABLE_BACKUP_FORBIDDEN: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    TTL_INVALID: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    FILE_NOT_FOUND: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    FILE_TOO_LARGE: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    FILE_TYPE_FORBIDDEN: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    FILE_FIELD_TYPE_REQUIRED: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
    INTERNAL_ERROR: {
        code: string;
        id: number;
        status: number;
        message: string;
    };
};
export type ErrorCode = keyof typeof ERROR_CODES;
