import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ProjectService } from './project.service';
import { DdtException } from '../common/ddt-exception';

@Controller('api/admin/v1/projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(@Body() body: { name: string; description?: string }) {
    const project = await this.projectService.create(body.name, body.description);
    return {
      success: true,
      data: project,
      error: null,
    };
  }

  @Get()
  async findAll() {
    const projects = await this.projectService.findAll();
    return {
      success: true,
      data: projects,
      error: null,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const project = await this.projectService.findById(id);
    if (!project) {
      throw new DdtException('PROJECT_NOT_FOUND');
    }
    return {
      success: true,
      data: project,
      error: null,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { name?: string; description?: string }) {
    const project = await this.projectService.update(id, body.name, body.description);
    if (!project) {
      throw new DdtException('PROJECT_NOT_FOUND');
    }
    return {
      success: true,
      data: project,
      error: null,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const success = await this.projectService.delete(id);
    if (!success) {
      throw new DdtException('PROJECT_NOT_FOUND');
    }
    return {
      success: true,
      data: null,
      error: null,
    };
  }
}
