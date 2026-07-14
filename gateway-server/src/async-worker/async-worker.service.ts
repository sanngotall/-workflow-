import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import axios from 'axios';
import { TransformerService } from '../transformers/transformer.service';
import { RequestLogService } from '../request-logs/request-log.service';
import { RouteCacheData } from '../routes/route.service';

interface AsyncTaskData {
  taskId: string;
  route: RouteCacheData;
  body: any;
  clientIp: string;
}

@Processor('async-tasks')
export class AsyncWorker {
  constructor(
    private readonly transformerService: TransformerService,
    private readonly requestLogService: RequestLogService,
  ) {}

  @Process()
  async process(job: Job<AsyncTaskData>) {
    const { taskId, route, body, clientIp } = job.data;
    const startTime = Date.now();

    try {
      let transformedBody = body;

      if (route.transformer) {
        transformedBody = await this.transformerService.transform(route.transformer, body);
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (route.credential) {
        if (route.credential.type === 'Bearer') {
          headers['Authorization'] = `Bearer ${route.credential.secret}`;
        } else if (route.credential.type === 'Basic') {
          headers['Authorization'] = `Basic ${route.credential.secret}`;
        }
      }

      const response = await axios({
        method: route.route.method.toLowerCase(),
        url: route.transformer?.target_url || '',
        data: transformedBody,
        headers,
        timeout: route.route.timeout_ms,
      });

      await this.requestLogService.create({
        project_id: route.route.project_id,
        route_id: route.route.id,
        environment: route.route.environment,
        client_ip: clientIp,
        method: route.route.method,
        path: route.route.path,
        request_body_raw: JSON.stringify(body),
        transformed_body_raw: JSON.stringify(transformedBody),
        response_body_raw: JSON.stringify(response.data),
        http_status: response.status,
        latency_ms: Date.now() - startTime,
      });
    } catch (error) {
      const httpStatus = axios.isAxiosError(error) && error.response?.status
        ? error.response.status
        : 500;

      await this.requestLogService.create({
        project_id: route.route.project_id,
        route_id: route.route.id,
        environment: route.route.environment,
        client_ip: clientIp,
        method: route.route.method,
        path: route.route.path,
        request_body_raw: JSON.stringify(body),
        transformed_body_raw: JSON.stringify(null),
        response_body_raw: JSON.stringify(error),
        http_status: httpStatus,
        error_code: axios.isAxiosError(error) && error.code === 'ECONNABORTED'
          ? 'TARGET_TIMEOUT'
          : 'TARGET_SERVER_ERROR',
        latency_ms: Date.now() - startTime,
      });
    }
  }
}
