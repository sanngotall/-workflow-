"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
let QueueService = class QueueService {
    constructor(asyncTaskQueue) {
        this.asyncTaskQueue = asyncTaskQueue;
    }
    async getStats() {
        const counts = await this.asyncTaskQueue.getJobCounts();
        return {
            waiting: counts.waiting,
            active: counts.active,
            failed: counts.failed,
            completed: counts.completed,
        };
    }
    async getTasks(status, limit = 50) {
        const types = status
            ? [status]
            : ['waiting', 'active', 'completed', 'failed'];
        const jobs = await this.asyncTaskQueue.getJobs(types, 0, limit);
        return jobs.map((job) => this.toAsyncTask(job));
    }
    async getTaskById(id) {
        const job = await this.asyncTaskQueue.getJob(id);
        if (!job) {
            return null;
        }
        return this.toAsyncTask(job);
    }
    toAsyncTask(job) {
        const routeId = job.data?.route?.route?.id || job.data?.route?.id || '';
        return {
            id: String(job.id),
            route_id: routeId,
            status: (job.finishedOn
                ? job.failedReason
                    ? 'failed'
                    : 'completed'
                : job.processedOn
                    ? 'active'
                    : 'waiting'),
            attempts: job.attemptsMade || 0,
            created_at: job.timestamp
                ? new Date(job.timestamp).toISOString()
                : new Date().toISOString(),
            completed_at: job.finishedOn
                ? new Date(job.finishedOn).toISOString()
                : undefined,
        };
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)('async-tasks')),
    __metadata("design:paramtypes", [Object])
], QueueService);
//# sourceMappingURL=queue.service.js.map