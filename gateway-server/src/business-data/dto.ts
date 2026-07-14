// 业务数据存储模块 DTO 集合（对齐 SPEC-04 §6 API 契约）
// 所有入参对象统一在此声明，供 controller / service 共享。
//
// 装饰器说明：
// - class-validator 提供 @IsString / @IsBoolean / @IsIn 等，配合 main.ts 的 ValidationPipe
//   (whitelist + forbidNonWhitelisted) 完成入参校验与字段白名单过滤。
// - class-transformer 的 @ValidateNested + @Type 处理嵌套对象数组。
// - 未加装饰器的属性会被 whitelist 剥离，因此每个可接收字段都必须显式标注。

import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsIn,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 创建业务字段 DTO（对齐 SPEC-04 §6.1.2 fields 子结构）
 */
export class CreateBusinessFieldDto {
  @IsOptional()
  @IsString()
  id?: string; // 更新时携带；新增时不传

  @IsString()
  name: string;

  @IsIn(['string', 'number', 'boolean', 'json', 'timestamp', 'file'])
  type: 'string' | 'number' | 'boolean' | 'json' | 'timestamp' | 'file';

  @IsIn(['request', 'response', 'system'])
  source: 'request' | 'response' | 'system';

  @IsBoolean()
  enabled: boolean;

  @IsBoolean()
  nullable: boolean;

  @IsBoolean()
  is_primary_key: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * 创建业务表 DTO（对齐 SPEC-04 §6.1.2）
 */
export class CreateBusinessTableDto {
  @IsString()
  display_name: string;

  @IsIn(['persistent', 'cache'])
  storage_type: 'persistent' | 'cache';

  @IsOptional()
  @IsNumber()
  @Min(60)
  ttl_seconds?: number | null;

  @IsIn(['request', 'response', 'mixed'])
  source: 'request' | 'response' | 'mixed';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBusinessFieldDto)
  fields: CreateBusinessFieldDto[];
}

/**
 * 更新业务表 DTO（部分字段更新，table_name 不可改，对齐 SPEC-04 §6.1.3）
 * fields 项含 id 时为更新现有字段，不含 id 为新增字段。
 */
export class UpdateBusinessTableDto {
  @IsOptional()
  @IsString()
  display_name?: string;

  @IsOptional()
  @IsIn(['persistent', 'cache'])
  storage_type?: 'persistent' | 'cache';

  @IsOptional()
  @IsNumber()
  @Min(60)
  ttl_seconds?: number | null;

  @IsOptional()
  @IsIn(['request', 'response', 'mixed'])
  source?: 'request' | 'response' | 'mixed';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBusinessFieldDto)
  fields?: CreateBusinessFieldDto[]; // 含 id 时为更新，不含 id 为新增
}

/**
 * 新增行 DTO（动态字段，key 为字段名，对齐 SPEC-04 §6.2.2）
 *
 * 注意：此类型为 Record 类型别名，ValidationPipe 会跳过（非 class），
 * 字段值类型校验由 TableRowService.validateValueType 在运行时完成。
 * file 类型字段值为对象：{ fileId, fileName, mimeType, sizeBytes, sha256 }
 */
export type CreateRowDto = Record<string, string | number | boolean | object | null>;

/**
 * 更新行 DTO（部分字段，对齐 SPEC-04 §6.2.3）
 */
export type UpdateRowDto = Record<string, string | number | boolean | object | null>;

/**
 * 备份请求 DTO（对齐 SPEC-04 §6.4.1）
 */
export class BackupTableDto {
  @IsOptional()
  @IsBoolean()
  gzip?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
