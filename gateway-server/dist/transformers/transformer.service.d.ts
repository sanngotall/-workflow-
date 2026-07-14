import { Repository } from 'typeorm';
import { TransformerEntity } from './transformer.entity';
export declare class TransformerService {
    private readonly transformerRepository;
    constructor(transformerRepository: Repository<TransformerEntity>);
    create(routeId: string, targetUrl: string, type: string, credentialId?: string, mappingRules?: Record<string, any>, scriptCode?: string, responseRules?: Record<string, any>): Promise<TransformerEntity>;
    findById(id: string): Promise<TransformerEntity | null>;
    findByRouteId(routeId: string): Promise<TransformerEntity | null>;
    update(id: string, updates: Partial<TransformerEntity>): Promise<TransformerEntity | null>;
    delete(id: string): Promise<boolean>;
    transform(transformer: TransformerEntity, input: Record<string, any>): Promise<Record<string, any>>;
    private transformVisual;
    private getNestedValue;
    private transformScript;
}
