import { RouteService } from '../routes/route.service';
import { WxConfigService } from '../wx-config/wx-config.service';
export declare class WxAuthService {
    private readonly routeService;
    private readonly wxConfigService;
    private readonly logger;
    private readonly WX_JSCODE2SESSION_URL;
    private readonly WX_JWT_EXPIRES_IN;
    constructor(routeService: RouteService, wxConfigService: WxConfigService);
    login(transitId: string, wxCode: string, userId?: string): Promise<{
        token: string;
        expiresIn: number;
        openid: string;
    }>;
    private callWxJscode2session;
}
