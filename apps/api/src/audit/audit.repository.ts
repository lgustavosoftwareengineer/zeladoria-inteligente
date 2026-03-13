import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '@/audit/entities/audit-log.entity';

export interface IAuditRepository {
  save(log: Partial<AuditLog>): Promise<AuditLog>;
  findByReportId(reportId: string): Promise<AuditLog[]>;
}

@Injectable()
export class AuditRepository {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repository: Repository<AuditLog>,
  ) {}

  save(log: Partial<AuditLog>): Promise<AuditLog> {
    return this.repository.save(this.repository.create(log));
  }

  findByReportId(reportId: string): Promise<AuditLog[]> {
    return this.repository.find({
      where: { reportId },
      order: { createdAt: 'DESC' },
    });
  }
}
