import { ProjectService } from './project.service';
export declare class ProjectController {
    private readonly projectService;
    constructor(projectService: ProjectService);
    create(body: {
        name: string;
        description?: string;
    }): Promise<{
        success: boolean;
        data: import("./project.entity").ProjectEntity;
        error: null;
    }>;
    findAll(): Promise<{
        success: boolean;
        data: import("./project.entity").ProjectEntity[];
        error: null;
    }>;
    findById(id: string): Promise<{
        success: boolean;
        data: import("./project.entity").ProjectEntity;
        error: null;
    }>;
    update(id: string, body: {
        name?: string;
        description?: string;
    }): Promise<{
        success: boolean;
        data: import("./project.entity").ProjectEntity;
        error: null;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        data: null;
        error: null;
    }>;
}
