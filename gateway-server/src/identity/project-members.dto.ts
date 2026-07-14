import {
  IsArray,
  IsString,
  IsIn,
  ValidateNested,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 项目成员管理 DTO（对齐 SPEC-05 §6.3）
 */

export class AddMemberItemDto {
  @IsUUID()
  user_id: string;

  @IsIn([
    'admin',
    'architect',
    'developer',
    'editor',
    'ops',
    'tester',
    'operator',
    'analyst',
    'viewer',
  ])
  role: string;
}

export class AddMembersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddMemberItemDto)
  members: AddMemberItemDto[];
}

export class UpdateMemberRoleDto {
  @IsIn([
    'admin',
    'architect',
    'developer',
    'editor',
    'ops',
    'tester',
    'operator',
    'analyst',
    'viewer',
  ])
  role: string;
}

export class SearchAvailableUsersDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  pageSize?: string;
}
