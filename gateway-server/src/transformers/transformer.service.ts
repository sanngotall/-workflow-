import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransformerEntity } from './transformer.entity';
import { VM } from 'vm2';

@Injectable()
export class TransformerService {
  constructor(
    @InjectRepository(TransformerEntity)
    private readonly transformerRepository: Repository<TransformerEntity>,
  ) {}

  async create(
    routeId: string,
    targetUrl: string,
    type: string,
    credentialId?: string,
    mappingRules?: Record<string, any>,
    scriptCode?: string,
    responseRules?: Record<string, any>,
  ): Promise<TransformerEntity> {
    const transformer = this.transformerRepository.create({
      route_id: routeId,
      credential_id: credentialId,
      target_url: targetUrl,
      type,
      mapping_rules: mappingRules,
      script_code: scriptCode,
      response_rules: responseRules,
    });
    return this.transformerRepository.save(transformer);
  }

  async findById(id: string): Promise<TransformerEntity | null> {
    return this.transformerRepository.findOne({ where: { id } });
  }

  async findByRouteId(routeId: string): Promise<TransformerEntity | null> {
    return this.transformerRepository.findOne({ where: { route_id: routeId } });
  }

  async update(
    id: string,
    updates: Partial<TransformerEntity>,
  ): Promise<TransformerEntity | null> {
    const transformer = await this.findById(id);
    if (!transformer) return null;

    Object.assign(transformer, updates);
    return this.transformerRepository.save(transformer);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.transformerRepository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async transform(
    transformer: TransformerEntity,
    input: Record<string, any>,
  ): Promise<Record<string, any>> {
    if (transformer.type === 'visual') {
      return this.transformVisual(transformer.mapping_rules || {}, input);
    } else if (transformer.type === 'script') {
      return this.transformScript(transformer.script_code || '', input);
    }
    return input;
  }

  private transformVisual(
    mappingRules: Record<string, any>,
    input: Record<string, any>,
  ): Record<string, any> {
    const output: Record<string, any> = {};
    for (const [targetKey, sourcePath] of Object.entries(mappingRules)) {
      output[targetKey] = this.getNestedValue(input, sourcePath);
    }
    return output;
  }

  private getNestedValue(obj: Record<string, any>, path: string): any {
    const parts = path.split('.');
    let current: any = obj;
    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }
    return current;
  }

  private transformScript(scriptCode: string, input: Record<string, any>): Record<string, any> {
    const vm = new VM({
      timeout: 5000,
      sandbox: {
        req: { body: input },
      },
    });

    try {
      const result = vm.run(scriptCode);
      return typeof result === 'object' ? result : input;
    } catch {
      return input;
    }
  }
}
