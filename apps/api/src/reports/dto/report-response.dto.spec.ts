import { ReportResponseDto } from '@/reports/dto/report-response.dto';
import { STUB_REPORT } from '@/reports/stubs';

describe('ReportResponseDto', () => {
  describe('fromEntity', () => {
    it('should return a plain object with all entity fields mapped', () => {
      // Act
      const result = ReportResponseDto.fromEntity(STUB_REPORT);

      // Assert
      expect(result).toEqual({
        id: STUB_REPORT.id,
        title: STUB_REPORT.title,
        description: STUB_REPORT.description,
        location: STUB_REPORT.location,
        category: STUB_REPORT.category,
        priority: STUB_REPORT.priority,
        technicalSummary: STUB_REPORT.technicalSummary,
        createdAt: STUB_REPORT.createdAt,
      });
    });

    it('should not mutate the input report', () => {
      // Arrange
      const reportCopy = { ...STUB_REPORT };

      // Act
      ReportResponseDto.fromEntity(STUB_REPORT);

      // Assert
      expect(STUB_REPORT).toEqual(reportCopy);
    });

    it('should return a new object on each call', () => {
      // Act
      const first = ReportResponseDto.fromEntity(STUB_REPORT);
      const second = ReportResponseDto.fromEntity(STUB_REPORT);

      // Assert
      expect(first).not.toBe(second);
      expect(first).toEqual(second);
    });
  });
});
