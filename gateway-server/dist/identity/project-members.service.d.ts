import { Repository } from 'typeorm';
import { ProjectMemberEntity } from './project-member.entity';
import { UserEntity } from './user.entity';
import { ProjectRole } from './roles';
import { AddMembersDto, UpdateMemberRoleDto } from './project-members.dto';
export declare class ProjectMembersService {
    private readonly memberRepo;
    private readonly userRepo;
    private readonly logger;
    constructor(memberRepo: Repository<ProjectMemberEntity>, userRepo: Repository<UserEntity>);
    list(projectId: string): Promise<{
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
    }>;
    add(projectId: string, dto: AddMembersDto, operatorId: string): Promise<{
        added: Array<{
            user_id: string;
            role: string;
        }>;
        skipped: Array<{
            user_id: string;
            reason: string;
        }>;
    }>;
    updateRole(projectId: string, memberId: string, dto: UpdateMemberRoleDto, operatorId: string): Promise<void>;
    remove(projectId: string, memberId: string, operatorId: string): Promise<void>;
    available(projectId: string, params: {
        keyword?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{
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
    }>;
    getMemberRole(projectId: string, userId: string): Promise<ProjectRole | null>;
}
