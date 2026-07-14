import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProjectMembersService } from '../identity/project-members.service';
export declare class PermissionGuard implements CanActivate {
    private readonly reflector;
    private readonly membersService;
    constructor(reflector: Reflector, membersService: ProjectMembersService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
