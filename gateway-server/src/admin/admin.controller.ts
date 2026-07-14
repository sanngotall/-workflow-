import { Controller, Post, Body, Param } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('api/admin/v1')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('projects/:projectId/routes')
  async createRouteWithTransformer(
    @Param('projectId') projectId: string,
    @Body() body: {
      environment: string;
      method: string;
      path: string;
      is_async?: boolean;
      timeout_ms?: number;
      transformer: {
        credential_id?: string;
        target_url: string;
        type: string;
        mapping_rules?: Record<string, any>;
        script_code?: string;
        response_rules?: Record<string, any>;
      };
    },
  ) {
    const result = await this.adminService.createRouteWithTransformer({
      project_id: projectId,
      ...body,
    });
    return {
      success: true,
      data: result,
      error: null,
    };
  }
}
