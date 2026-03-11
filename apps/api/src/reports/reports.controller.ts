import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CreateReportDto } from '@/reports/dto/create-report.dto';
import { ReportResponseDto } from '@/reports/dto/report-response.dto';
import { ReportsService } from '@/reports/reports.service';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a citizen problem report' })
  @ApiCreatedResponse({
    type: ReportResponseDto,
    description: 'Report created and enriched by AI',
  })
  @ApiUnprocessableEntityResponse({
    description: 'AI returned an invalid response',
  })
  @ApiServiceUnavailableResponse({
    description: 'AI provider is temporarily unavailable',
  })
  create(@Body() dto: CreateReportDto): Promise<ReportResponseDto> {
    return this.reportsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all reports' })
  @ApiOkResponse({ type: [ReportResponseDto] })
  findAll(): Promise<ReportResponseDto[]> {
    return this.reportsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a report by ID' })
  @ApiOkResponse({ type: ReportResponseDto })
  @ApiNotFoundResponse({ description: 'Report not found' })
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<ReportResponseDto> {
    return this.reportsService.findById(id);
  }
}
