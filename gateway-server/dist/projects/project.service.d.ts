import { Repository } from 'typeorm';
import { ProjectEntity } from './project.entity';
export declare class ProjectService {
    private readonly projectRepository;
    constructor(projectRepository: Repository<ProjectEntity>);
    create(name: string, description?: string): Promise<ProjectEntity>;
    findById(id: string): Promise<ProjectEntity | null>;
    findAll(): Promise<ProjectEntity[]>;
    update(id: string, name?: string, description?: string): Promise<ProjectEntity | null>;
    delete(id: string): Promise<boolean>;
}
