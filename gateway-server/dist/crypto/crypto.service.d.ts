import { ConfigService } from '../config/config.service';
export declare class CryptoService {
    private readonly configService;
    private readonly key;
    constructor(configService: ConfigService);
    encrypt(plaintext: string): string;
    decrypt(ciphertext: string): string;
}
