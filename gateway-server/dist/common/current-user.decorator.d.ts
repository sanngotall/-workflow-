export interface CurrentUserPayload {
    userId: string;
    username: string;
    globalRoles: string[];
    jti: string;
    tokenId?: string;
}
export declare const CurrentUser: (...dataOrPipes: (keyof CurrentUserPayload | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
