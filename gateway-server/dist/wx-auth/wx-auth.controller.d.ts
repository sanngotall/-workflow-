import { FastifyReply } from 'fastify';
import { WxAuthService } from './wx-auth.service';
export declare class WxAuthController {
    private readonly wxAuthService;
    private readonly logger;
    constructor(wxAuthService: WxAuthService);
    login(transitId: string, body: {
        wxCode?: string;
        userId?: string;
    }, reply: FastifyReply): Promise<void>;
}
