import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CredentialEntity } from './credential.entity';
import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class CredentialService {
  constructor(
    @InjectRepository(CredentialEntity)
    private readonly credentialRepository: Repository<CredentialEntity>,
    private readonly cryptoService: CryptoService,
  ) {}

  async create(
    projectId: string,
    name: string,
    type: string,
    secret: string,
  ): Promise<CredentialEntity> {
    const encryptedSecret = this.cryptoService.encrypt(secret);
    const credential = this.credentialRepository.create({
      project_id: projectId,
      name,
      type,
      encrypted_secret: encryptedSecret,
    });
    return this.credentialRepository.save(credential);
  }

  async findById(id: string): Promise<CredentialEntity | null> {
    return this.credentialRepository.findOne({ where: { id } });
  }

  async findByProjectId(projectId: string): Promise<CredentialEntity[]> {
    return this.credentialRepository.find({ where: { project_id: projectId } });
  }

  async getDecryptedSecret(id: string): Promise<string | null> {
    const credential = await this.findById(id);
    if (!credential) return null;
    return this.cryptoService.decrypt(credential.encrypted_secret);
  }

  async update(
    id: string,
    name?: string,
    type?: string,
    secret?: string,
  ): Promise<CredentialEntity | null> {
    const credential = await this.findById(id);
    if (!credential) return null;

    if (name !== undefined) credential.name = name;
    if (type !== undefined) credential.type = type;
    if (secret !== undefined) credential.encrypted_secret = this.cryptoService.encrypt(secret);

    return this.credentialRepository.save(credential);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.credentialRepository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }
}
