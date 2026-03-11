import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from '@/reports/entities/report.entity';
import { ReportsController } from '@/reports/reports.controller';
import { ReportsRepository } from '@/reports/reports.repository';
import { ReportsService } from '@/reports/reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([Report])],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsRepository],
})
export class ReportsModule {}
