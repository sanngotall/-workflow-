import { Repository } from 'typeorm';
import { CredentialEntity } from './credential.entity';
import { CryptoService } from '../crypto/crypto.service';
export declare class CredentialService {
    private readonly credentialRepository;
    private readonly cryptoService;
    constructor(credentialRepository: Repository<CredentialEntity>, cryptoService: CryptoService);
    create(projectId: string, name: string, type: string, secret: string): Promise<CredentialEntity>;
    findById(id: string): Promise<CredentialEntity | null>;
    findByProjectId(projectId: string): Promise<CredentialEntity[]>;
    getDecryptedSecret(id: string): Promise<string | null>;
    update(id: string, name?: string, type?: string, secret?: string): Promise<CredentialEntity | null>;
    delete(id: string): Promise<boolean>;
}
