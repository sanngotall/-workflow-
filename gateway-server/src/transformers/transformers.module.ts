import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransformerEntity } from './transformer.entity';
import { TransformerService } from './transformer.service';
import { TransformerController } from './transformer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TransformerEntity])],
  providers: [TransformerService],
  controllers: [TransformerController],
  exports: [TransformerService],
})
export class TransformersModule {}
