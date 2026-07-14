import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredentialEntity } from './credential.entity';
import { CredentialService } from './credential.service';
import { CredentialController } from './credential.controller';
import { CryptoModule } from '../crypto/crypto.module';

@Module({
  imports: [TypeOrmModule.forFeature([CredentialEntity]), CryptoModule],
  providers: [CredentialService],
  controllers: [CredentialController],
  exports: [CredentialService],
})
export class CredentialsModule {}
