import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  DEFAULT_REPORT_CATEGORY,
  DEFAULT_REPORT_PRIORITY,
} from '@/core/domain';
import {
  AUDIT_LOGGER_PORT,
  AuditEvent,
  LLM_ANALYZER_PORT,
  LlmAnalysisResult,
} from '@/core/ports';
import { CreateReportDto } from '@/reports/dto/create-report.dto';
import { ReportResponseDto } from '@/reports/dto/report-response.dto';
import { Report } from '@/reports/entities/report.entity';
import {
  type IReportsRepository,
  ReportsRepository,
} from '@/reports/reports.repository';
import type { IAuditLogger, ILlmAnalyzer } from '@/core/ports';

@Injectable()
export class ReportsService {
  constructor(
    @Inject(ReportsRepository)
    private readonly reportsRepository: IReportsRepository,
    @Inject(LLM_ANALYZER_PORT) private readonly llmAnalyzer: ILlmAnalyzer,
    @Inject(AUDIT_LOGGER_PORT) private readonly auditLogger: IAuditLogger,
  ) {}

  async create(dto: CreateReportDto): Promise<ReportResponseDto> {
    const report = await this.createInitialReport(dto);
    try {
      const analysis = await this.llmAnalyzer.analyze(dto);
      await this.logSuccess(report.id, dto, analysis);

      const enriched = await this.enrichReport(report, analysis.output);

      return ReportResponseDto.fromEntity(enriched);
    } catch (err) {
      await this.logFailure(report.id, dto, err as Error);
      throw err;
    }
  }

  async findAll(): Promise<ReportResponseDto[]> {
    const reports = await this.reportsRepository.findAll();

    return reports.map((report) => ReportResponseDto.fromEntity(report));
  }

  async findById(id: string): Promise<ReportResponseDto> {
    const report = await this.reportsRepository.findById(id);

    if (!report) {
      throw new NotFoundException(`Report ${id} not found`);
    }

    return ReportResponseDto.fromEntity(report);
  }

  private createInitialReport(dto: CreateReportDto): Promise<Report> {
    return this.reportsRepository.save({
      title: dto.title,
      description: dto.description,
      location: dto.location,
      category: DEFAULT_REPORT_CATEGORY,
      priority: DEFAULT_REPORT_PRIORITY,
      technicalSummary: '',
    });
  }

  private enrichReport(
    report: Report,
    output: LlmAnalysisResult['output'],
  ): Promise<Report> {
    return this.reportsRepository.save({
      ...report,
      category: output.category,
      priority: output.priority,
      technicalSummary: output.technical_summary,
    });
  }

  private logSuccess(
    reportId: string,
    dto: CreateReportDto,
    analysis: LlmAnalysisResult,
  ): Promise<void> {
    return this.auditLogger.createLog({
      reportId,
      promptSent: JSON.stringify(dto),
      eventType: AuditEvent.LLM_SUCCEEDED,
      rawResponse: analysis.rawResponse,
      latencyMs: analysis.latencyMs,
    });
  }

  private logFailure(
    reportId: string,
    dto: CreateReportDto,
    error: Error,
  ): Promise<void> {
    return this.auditLogger.createLog({
      reportId,
      promptSent: JSON.stringify(dto),
      eventType: AuditEvent.LLM_FAILED,
      errorMessage: error.message,
    });
  }
}
