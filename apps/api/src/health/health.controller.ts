import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({
    schema: {
      example: { status: 'ok', timestamp: '2026-03-11T16:00:00.000Z' },
    },
  })
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
