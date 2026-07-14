import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { TransformerService } from './transformer.service';

@Controller('api/admin/v1/transformers')
export class TransformerController {
  constructor(private readonly transformerService: TransformerService) {}

  @Post()
  async create(@Body() body: {
    route_id: string;
    target_url: string;
    type: string;
    credential_id?: string;
    mapping_rules?: Record<string, any>;
    script_code?: string;
    response_rules?: Record<string, any>;
  }) {
    const transformer = await this.transformerService.create(
      body.route_id,
      body.target_url,
      body.type,
      body.credential_id,
      body.mapping_rules,
      body.script_code,
      body.response_rules,
    );
    return {
      success: true,
      data: transformer,
      error: null,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const transformer = await this.transformerService.findById(id);
    if (!transformer) {
      return {
        success: false,
        data: null,
        error: {
          code: 'TRANSFORMER_NOT_FOUND',
          message: '转换器不存在',
        },
      };
    }
    return {
      success: true,
      data: transformer,
      error: null,
    };
  }

  @Get('route/:routeId')
  async findByRouteId(@Param('routeId') routeId: string) {
    const transformer = await this.transformerService.findByRouteId(routeId);
    return {
      success: true,
      data: transformer,
      error: null,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<{
    target_url: string;
    type: string;
    credential_id: string;
    mapping_rules: Record<string, any>;
    script_code: string;
    response_rules: Record<string, any>;
  }>) {
    const transformer = await this.transformerService.update(id, body);
    if (!transformer) {
      return {
        success: false,
        data: null,
        error: {
          code: 'TRANSFORMER_NOT_FOUND',
          message: '转换器不存在',
        },
      };
    }
    return {
      success: true,
      data: transformer,
      error: null,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const success = await this.transformerService.delete(id);
    if (!success) {
      return {
        success: false,
        data: null,
        error: {
          code: 'TRANSFORMER_NOT_FOUND',
          message: '转换器不存在',
        },
      };
    }
    return {
      success: true,
      data: null,
      error: null,
    };
  }
}
