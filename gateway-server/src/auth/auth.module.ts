import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { RedisModule } from '../redis/redis.module';
import { UserEntity } from '../identity/user.entity';
import { GlobalRoleEntity } from '../identity/global-role.entity';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    RedisModule,
    TypeOrmModule.forFeature([UserEntity, GlobalRoleEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: configService.jwtExpiresIn },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
