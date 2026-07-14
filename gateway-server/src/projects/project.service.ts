import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity } from './project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepository: Repository<ProjectEntity>,
  ) {}

  async create(name: string, description?: string): Promise<ProjectEntity> {
    const project = this.projectRepository.create({
      name,
      description,
    });
    return this.projectRepository.save(project);
  }

  async findById(id: string): Promise<ProjectEntity | null> {
    return this.projectRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<ProjectEntity[]> {
    return this.projectRepository.find();
  }

  async update(id: string, name?: string, description?: string): Promise<ProjectEntity | null> {
    const project = await this.findById(id);
    if (!project) return null;

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;

    return this.projectRepository.save(project);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.projectRepository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }
}
