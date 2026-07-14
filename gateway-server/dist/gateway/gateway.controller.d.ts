import { FastifyRequest, FastifyReply } from 'fastify';
import { GatewayService } from './gateway.service';
export declare class GatewayController {
    private readonly gatewayService;
    private readonly logger;
    constructor(gatewayService: GatewayService);
    invoke(transitId: string, body: any, req: FastifyRequest, reply: FastifyReply): Promise<void>;
}
