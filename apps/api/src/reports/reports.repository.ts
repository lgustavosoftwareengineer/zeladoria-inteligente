import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '@/reports/entities/report.entity';

export interface IReportsRepository {
  save(reportData: Partial<Report>): Promise<Report>;
  findAll(): Promise<Report[]>;
  findById(id: string): Promise<Report | null>;
}

@Injectable()
export class ReportsRepository {
  constructor(
    @InjectRepository(Report)
    private readonly repository: Repository<Report>,
  ) {}

  save(reportData: Partial<Report>): Promise<Report> {
    return this.repository.save(this.repository.create(reportData));
  }

  findAll(): Promise<Report[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  findById(id: string): Promise<Report | null> {
    return this.repository.findOneBy({ id });
  }
}
