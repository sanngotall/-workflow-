import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CredentialService } from './credential.service';

@Controller('api/admin/v1/credentials')
export class CredentialController {
  constructor(private readonly credentialService: CredentialService) {}

  @Post()
  async create(@Body() body: { project_id: string; name: string; type: string; secret: string }) {
    const credential = await this.credentialService.create(
      body.project_id,
      body.name,
      body.type,
      body.secret,
    );
    return {
      success: true,
      data: {
        id: credential.id,
        name: credential.name,
        type: credential.type,
        created_at: credential.created_at,
      },
      error: null,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const credential = await this.credentialService.findById(id);
    if (!credential) {
      return {
        success: false,
        data: null,
        error: {
          code: 'CREDENTIAL_NOT_FOUND',
          message: '凭证不存在',
        },
      };
    }
    return {
      success: true,
      data: {
        id: credential.id,
        name: credential.name,
        type: credential.type,
        created_at: credential.created_at,
      },
      error: null,
    };
  }

  @Get('project/:projectId')
  async findByProjectId(@Param('projectId') projectId: string) {
    const credentials = await this.credentialService.findByProjectId(projectId);
    return {
      success: true,
      data: credentials.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        created_at: c.created_at,
      })),
      error: null,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { name?: string; type?: string; secret?: string }) {
    const credential = await this.credentialService.update(id, body.name, body.type, body.secret);
    if (!credential) {
      return {
        success: false,
        data: null,
        error: {
          code: 'CREDENTIAL_NOT_FOUND',
          message: '凭证不存在',
        },
      };
    }
    return {
      success: true,
      data: {
        id: credential.id,
        name: credential.name,
        type: credential.type,
        created_at: credential.created_at,
      },
      error: null,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const success = await this.credentialService.delete(id);
    if (!success) {
      return {
        success: false,
        data: null,
        error: {
          code: 'CREDENTIAL_NOT_FOUND',
          message: '凭证不存在',
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
