import { ProjectMembersService } from './project-members.service';
import { AddMembersDto, UpdateMemberRoleDto, SearchAvailableUsersDto } from './project-members.dto';
export declare class ProjectMembersController {
    private readonly membersService;
    constructor(membersService: ProjectMembersService);
    list(projectId: string): Promise<{
        success: boolean;
        data: {
            items: Array<{
                id: string;
                user_id: string;
                username: string;
                name: string;
                avatar_url: string | null;
                role: string;
                joined_at: Date;
            }>;
            total: number;
        };
        error: null;
    }>;
    available(projectId: string, dto: SearchAvailableUsersDto): Promise<{
        success: boolean;
        data: {
            items: Array<{
                id: string;
                username: string;
                email: string;
                name: string;
                avatar_url: string | null;
            }>;
            total: number;
            page: number;
            pageSize: number;
        };
        error: null;
    }>;
    add(projectId: string, dto: AddMembersDto, operatorId: string): Promise<{
        success: boolean;
        data: {
            added: Array<{
                user_id: string;
                role: string;
            }>;
            skipped: Array<{
                user_id: string;
                reason: string;
            }>;
        };
        error: null;
    }>;
    updateRole(projectId: string, memberId: string, dto: UpdateMemberRoleDto, operatorId: string): Promise<{
        success: boolean;
        data: null;
        error: null;
    }>;
    remove(projectId: string, memberId: string, operatorId: string): Promise<{
        success: boolean;
        data: null;
        error: null;
    }>;
}
