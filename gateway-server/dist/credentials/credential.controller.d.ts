import { CredentialService } from './credential.service';
export declare class CredentialController {
    private readonly credentialService;
    constructor(credentialService: CredentialService);
    create(body: {
        project_id: string;
        name: string;
        type: string;
        secret: string;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            type: string;
            created_at: Date;
        };
        error: null;
    }>;
    findById(id: string): Promise<{
        success: boolean;
        data: null;
        error: {
            code: string;
            message: string;
        };
    } | {
        success: boolean;
        data: {
            id: string;
            name: string;
            type: string;
            created_at: Date;
        };
        error: null;
    }>;
    findByProjectId(projectId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            type: string;
            created_at: Date;
        }[];
        error: null;
    }>;
    update(id: string, body: {
        name?: string;
        type?: string;
        secret?: string;
    }): Promise<{
        success: boolean;
        data: null;
        error: {
            code: string;
            message: string;
        };
    } | {
        success: boolean;
        data: {
            id: string;
            name: string;
            type: string;
            created_at: Date;
        };
        error: null;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        data: null;
        error: {
            code: string;
            message: string;
        };
    } | {
        success: boolean;
        data: null;
        error: null;
    }>;
}
