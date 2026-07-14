import { Repository } from 'typeorm';
import { WxConfigEntity } from './wx-config.entity';
import { CryptoService } from '../crypto/crypto.service';
export declare class WxConfigService {
    private readonly wxConfigRepository;
    private readonly cryptoService;
    constructor(wxConfigRepository: Repository<WxConfigEntity>, cryptoService: CryptoService);
    findByProjectId(projectId: string): Promise<WxConfigEntity | null>;
    getDecryptedSecrets(projectId: string): Promise<{
        appId: string;
        appSecret: string;
        jwtSecret: string;
    } | null>;
    upsert(projectId: string, appId: string, appSecret: string, jwtSecret: string): Promise<WxConfigEntity>;
    deleteByProjectId(projectId: string): Promise<boolean>;
}
