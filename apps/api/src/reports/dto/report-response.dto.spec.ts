import { ReportResponseDto } from '@/reports/dto/report-response.dto';
import { Report } from '@/reports/entities/report.entity';

describe('ReportResponseDto', () => {
  const mockReport: Report = {
    id: 'uuid-123',
    title: 'Buraco na rua',
    description: 'Buraco enorme',
    location: 'Rua X, 10',
    category: 'Via Pública',
    priority: 'Alta',
    technicalSummary: 'Dano estrutural em via pública.',
    createdAt: new Date('2026-03-11T12:00:00.000Z'),
  };

  describe('fromEntity', () => {
    it('should return a plain object with all entity fields mapped', () => {
      // Act
      const result = ReportResponseDto.fromEntity(mockReport);

      // Assert
      expect(result).toEqual({
        id: mockReport.id,
        title: mockReport.title,
        description: mockReport.description,
        location: mockReport.location,
        category: mockReport.category,
        priority: mockReport.priority,
        technicalSummary: mockReport.technicalSummary,
        createdAt: mockReport.createdAt,
      });
    });

    it('should not mutate the input report', () => {
      // Arrange
      const reportCopy = { ...mockReport };

      // Act
      ReportResponseDto.fromEntity(mockReport);

      // Assert
      expect(mockReport).toEqual(reportCopy);
    });

    it('should return a new object on each call', () => {
      // Act
      const first = ReportResponseDto.fromEntity(mockReport);
      const second = ReportResponseDto.fromEntity(mockReport);

      // Assert
      expect(first).not.toBe(second);
      expect(first).toEqual(second);
    });
  });
});
