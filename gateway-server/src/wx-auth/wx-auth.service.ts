import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { RouteService } from '../routes/route.service';
import { WxConfigService } from '../wx-config/wx-config.service';
import { DdtException } from '../common/ddt-exception';

/**
 * 微信小程序登录服务（对齐 SPEC-04 §6.8.1）
 *
 * 职责：
 * 1. 从 transitId 反查 route.project_id
 * 2. 调 WxConfigService.getDecryptedSecrets 拿 { appId, appSecret, jwtSecret }
 * 3. 调微信 jscode2session 换 openid + session_key
 * 4. 用项目级 jwtSecret 签发业务 JWT（payload 含 openid / projectId / userId / iat / exp）
 * 5. 返回 token（不返回 session_key，避免泄露）
 *
 * 安全约束：
 * - JWT 用项目级 jwtSecret 签发，与系统 JWT_SECRET 隔离（多租户隔离）
 * - session_key 不返回给客户端
 * - 不持久化 openid，每次登录都重新换 code（无状态签发）
 */
@Injectable()
export class WxAuthService {
  private readonly logger = new Logger(WxAuthService.name);
  /** 微信 jscode2session 接口地址 */
  private readonly WX_JSCODE2SESSION_URL = 'https://api.weixin.qq.com/sns/jscode2session';
  /** 微信业务 JWT 有效期（秒），对齐前端 expiresIn */
  private readonly WX_JWT_EXPIRES_IN = 7200;

  constructor(
    private readonly routeService: RouteService,
    private readonly wxConfigService: WxConfigService,
  ) {}

  /**
   * 微信小程序登录换 token
   *
   * @param transitId 中转 ID（即 route.id），由路径参数提供
   * @param wxCode wx.login() 返回的 5 分钟有效 code
   * @param userId 可选，业务侧用户标识（如手机号、业务 ID）
   */
  async login(
    transitId: string,
    wxCode: string,
    userId?: string,
  ): Promise<{ token: string; expiresIn: number; openid: string }> {
    // 1. transitId 反查 route.project_id
    const route = await this.routeService.findById(transitId);
    if (!route) {
      throw new DdtException('ROUTE_NOT_FOUND');
    }
    const projectId = route.project_id;

    // 2. 拿解密后的微信配置
    const secrets = await this.wxConfigService.getDecryptedSecrets(projectId);
    if (!secrets) {
      throw new DdtException(
        'INVALID_ARGUMENT',
        '该项目未配置微信小程序身份（app_id/app_secret/jwt_secret），请先在项目详情页"微信配置" tab 填写',
      );
    }

    // 3. 调微信 jscode2session 换 openid + session_key
    const { openid, sessionKey } = await this.callWxJscode2session(
      secrets.appId,
      secrets.appSecret,
      wxCode,
    );

    // 4. 用项目级 jwtSecret 签发业务 JWT
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      openid,
      projectId,
      userId: userId || null,
      iat: now,
      exp: now + this.WX_JWT_EXPIRES_IN,
    };

    let token: string;
    try {
      token = jwt.sign(payload, secrets.jwtSecret, { algorithm: 'HS256' });
    } catch (err: any) {
      this.logger.error(`JWT 签发失败 project=${projectId}: ${err?.message || err}`);
      throw new DdtException('INTERNAL_ERROR', 'JWT 签发失败');
    }

    this.logger.log(
      `微信登录成功 project=${projectId} transit=${transitId} openid=${openid.slice(0, 6)}***`,
    );

    // 5. 返回 token（不返回 session_key）
    return {
      token,
      expiresIn: this.WX_JWT_EXPIRES_IN,
      openid,
    };
  }

  /**
   * 调微信 jscode2session 接口
   * 失败处理：
   * - 网络异常 → TARGET_SERVER_ERROR
   * - errcode != 0 → INVALID_ARGUMENT（带微信返回的 errmsg）
   */
  private async callWxJscode2session(
    appId: string,
    appSecret: string,
    wxCode: string,
  ): Promise<{ openid: string; sessionKey: string }> {
    let response;
    try {
      response = await axios.get(this.WX_JSCODE2SESSION_URL, {
        params: {
          appid: appId,
          secret: appSecret,
          js_code: wxCode,
          grant_type: 'authorization_code',
        },
        timeout: 10000,
      });
    } catch (err: any) {
      this.logger.error(
        `调微信 jscode2session 网络失败: ${err?.message || err}`,
      );
      throw new DdtException('TARGET_SERVER_ERROR', '调微信接口网络失败');
    }

    const data = response.data;
    // 微信接口 errcode=0 表示成功，否则返回 errmsg
    if (data.errcode && data.errcode !== 0) {
      this.logger.warn(
        `微信 jscode2session 返回错误 errcode=${data.errcode} errmsg=${data.errmsg}`,
      );
      throw new DdtException(
        'INVALID_ARGUMENT',
        `微信登录失败：${data.errmsg || 'code 无效或已过期'}（errcode=${data.errcode}）`,
      );
    }

    if (!data.openid || !data.session_key) {
      this.logger.warn(`微信 jscode2session 返回数据缺失 openid 或 session_key`);
      throw new DdtException(
        'INVALID_ARGUMENT',
        '微信登录返回数据异常，缺少 openid 或 session_key',
      );
    }

    return {
      openid: data.openid,
      sessionKey: data.session_key,
    };
  }
}
