import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { RouteService } from './route.service';
import { DdtException } from '../common/ddt-exception';

@Controller('api/admin/v1/routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  async create(@Body() body: {
    project_id: string;
    environment: string;
    method: string;
    path: string;
    is_async?: boolean;
    timeout_ms?: number;
    is_mock?: boolean;
    mock_response?: Record<string, any> | null;
  }) {
    const route = await this.routeService.create(
      body.project_id,
      body.environment,
      body.method,
      body.path,
      body.is_async,
      body.timeout_ms,
      body.is_mock,
      body.mock_response,
    );
    return {
      success: true,
      data: route,
      error: null,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const route = await this.routeService.findById(id);
    if (!route) {
      throw new DdtException('ROUTE_NOT_FOUND');
    }
    return {
      success: true,
      data: route,
      error: null,
    };
  }

  @Get('project/:projectId')
  async findByProjectId(@Param('projectId') projectId: string) {
    const routes = await this.routeService.findByProjectId(projectId);
    return {
      success: true,
      data: routes,
      error: null,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<{
    environment: string;
    method: string;
    path: string;
    is_active: boolean;
    is_async: boolean;
    timeout_ms: number;
    is_mock: boolean;
    mock_response: Record<string, any> | null;
  }>) {
    const route = await this.routeService.update(id, body);
    if (!route) {
      throw new DdtException('ROUTE_NOT_FOUND');
    }
    return {
      success: true,
      data: route,
      error: null,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const success = await this.routeService.delete(id);
    if (!success) {
      throw new DdtException('ROUTE_NOT_FOUND');
    }
    return {
      success: true,
      data: null,
      error: null,
    };
  }
}
