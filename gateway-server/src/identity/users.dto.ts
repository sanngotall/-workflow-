import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsIn,
  Matches,
} from 'class-validator';

/**
 * 用户管理 DTO（对齐 SPEC-05 §6.2）
 */

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  // 至少 8 位且必须包含字母和数字（对齐 SPEC-05 §8 密码强度）
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, {
    message: '密码至少 8 位且必须包含字母和数字',
  })
  password: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsIn(['super_admin', 'admin'])
  // 创建用户时可选授予全局角色；不传则仅创建普通用户（无全局角色）
  global_role?: 'super_admin' | 'admin';
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}

export class UpdateUserStatusDto {
  @IsIn(['active', 'inactive', 'disabled'])
  status: 'active' | 'inactive' | 'disabled';
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(1)
  old_password: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, {
    message: '密码至少 8 位且必须包含字母和数字',
  })
  new_password: string;
}

export class AdminResetPasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, {
    message: '密码至少 8 位且必须包含字母和数字',
  })
  new_password: string;
}
