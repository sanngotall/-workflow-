import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { BusinessTableService } from './business-table.service';
import { TableRowService } from './table-row.service';
import { DdtException } from '../common/ddt-exception';
import {
  CreateBusinessTableDto,
  UpdateBusinessTableDto,
  CreateRowDto,
  UpdateRowDto,
  BackupTableDto,
} from './dto';

/**
 * 业务数据存储控制器（对齐 SPEC-04 §6 全部 12 个接口）
 * 路由前缀：/api/admin/v1
 *
 * 接口清单：
 * 6.1.1 GET    /projects/:projectId/business-tables
 * 6.1.2 POST   /projects/:projectId/business-tables
 * 6.1.3 PATCH  /business-tables/:tableId
 * 6.1.4 DELETE /business-tables/:tableId?confirm=true
 * 6.2.1 GET    /business-tables/:tableId/rows
 * 6.2.2 POST   /business-tables/:tableId/rows
 * 6.2.3 PATCH  /business-tables/:tableId/rows/:rowId
 * 6.2.4 DELETE /business-tables/:tableId/rows/:rowId
 * 6.3.1 GET    /database/cache-tables
 * 6.3.2 POST   /business-tables/:tableId/clear
 * 6.4.1 POST   /business-tables/:tableId/backup
 * 6.4.2 GET    /projects/:projectId/backups?type=backup|migration
 *
 * 响应统一遵循 SPEC-04 §1 Envelope：{ success, data, error }
 */
@Controller('api/admin/v1')
export class BusinessDataController {
  constructor(
    private readonly businessTableService: BusinessTableService,
    private readonly tableRowService: TableRowService,
  ) {}

  // ===== 6.1 业务表元数据 CRUD =====

  /** 6.1.1 列出某项目的业务表 */
  @Get('projects/:projectId/business-tables')
  async listByProject(
    @Param('projectId') projectId: string,
    @Query('storage_type') storageType?: 'persistent' | 'cache',
  ) {
    const data = await this.businessTableService.listByProject(
      projectId,
      storageType,
    );
    return { success: true, data, error: null };
  }

  /** 6.1.2 创建业务表（含动态建物理表） */
  @Post('projects/:projectId/business-tables')
  async createTable(
    @Param('projectId') projectId: string,
    @Body() body: CreateBusinessTableDto,
  ) {
    const data = await this.businessTableService.create(projectId, body);
    return { success: true, data, error: null };
  }

  /** 6.1.3 更新业务表字段配置 */
  @Patch('business-tables/:tableId')
  async updateTable(
    @Param('tableId') tableId: string,
    @Body() body: UpdateBusinessTableDto,
  ) {
    const data = await this.businessTableService.update(tableId, body);
    return { success: true, data, error: null };
  }

  /** 6.1.4 删除业务表（需 confirm=true 防误删） */
  @Delete('business-tables/:tableId')
  async removeTable(
    @Param('tableId') tableId: string,
    @Query('confirm') confirm?: string,
  ) {
    if (confirm !== 'true') {
      throw new DdtException(
        'INVALID_ARGUMENT',
        '删除业务表需 confirm=true 确认',
      );
    }
    const data = await this.businessTableService.remove(tableId);
    return { success: true, data, error: null };
  }

  // ===== 6.2 业务表数据图形化 CRUD =====

  /** 6.2.1 查询表数据（支持搜索与字段过滤） */
  @Get('business-tables/:tableId/rows')
  async listRows(
    @Param('tableId') tableId: string,
    @Query('search') search?: string,
    @Query('field') field?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('order_by') orderBy?: string,
  ) {
    const data = await this.tableRowService.listRows(tableId, {
      search,
      field,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      order_by: orderBy,
    });
    return { success: true, data, error: null };
  }

  /** 6.2.2 新增一行 */
  @Post('business-tables/:tableId/rows')
  async createRow(
    @Param('tableId') tableId: string,
    @Body() body: CreateRowDto,
  ) {
    const data = await this.tableRowService.createRow(tableId, body);
    return { success: true, data, error: null };
  }

  /** 6.2.3 双击编辑单元格 */
  @Patch('business-tables/:tableId/rows/:rowId')
  async updateRow(
    @Param('tableId') tableId: string,
    @Param('rowId') rowId: string,
    @Body() body: UpdateRowDto,
  ) {
    const data = await this.tableRowService.updateRow(tableId, rowId, body);
    return { success: true, data, error: null };
  }

  /** 6.2.4 删除一行 */
  @Delete('business-tables/:tableId/rows/:rowId')
  async deleteRow(
    @Param('tableId') tableId: string,
    @Param('rowId') rowId: string,
  ) {
    const data = await this.tableRowService.deleteRow(tableId, rowId);
    return { success: true, data, error: null };
  }

  // ===== 6.3 缓存管理 =====

  /** 6.3.1 列出缓存表 */
  @Get('database/cache-tables')
  async listCacheTables() {
    const data = await this.businessTableService.listCacheTables();
    return { success: true, data, error: null };
  }

  /** 6.3.2 清空缓存表 */
  @Post('business-tables/:tableId/clear')
  async clearCache(@Param('tableId') tableId: string) {
    const data = await this.businessTableService.clearCache(tableId);
    return { success: true, data, error: null };
  }

  // ===== 6.4 业务数据备份与迁移（本轮 mock） =====

  /** 6.4.1 触发单表备份（接口签名对齐 SPEC-04 §6.4.1，备份功能后续单独实现） */
  @Post('business-tables/:tableId/backup')
  async backup(
    @Param('tableId') tableId: string,
    @Body() body: BackupTableDto,
  ) {
    const data = await this.businessTableService.backup(tableId, body);
    return { success: true, data, error: null };
  }

  /** 6.4.2 列出备份与迁移记录（接口签名对齐 SPEC-04 §6.4.2，备份功能后续单独实现） */
  @Get('projects/:projectId/backups')
  async listBackups(
    @Param('projectId') projectId: string,
    @Query('type') type?: 'backup' | 'migration',
  ) {
    const data = await this.businessTableService.listBackups(projectId, type);
    return { success: true, data, error: null };
  }
}
