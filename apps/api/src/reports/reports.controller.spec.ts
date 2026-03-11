import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LlmUnavailableError } from '@/core/errors';
import { ReportResponseDto } from '@/reports/dto/report-response.dto';
import { ReportsController } from '@/reports/reports.controller';
import { ReportsService } from '@/reports/reports.service';

const MOCK_DTO: ReportResponseDto = {
  id: 'uuid-123',
  title: 'Buraco na rua',
  description: 'Buraco enorme',
  location: 'Rua X, 10',
  category: 'Via Pública',
  priority: 'Alta',
  technicalSummary: 'Dano estrutural identificado.',
  createdAt: new Date(),
};

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: jest.Mocked<ReportsService>;
  let createMock: jest.Mock;

  beforeEach(async () => {
    createMock = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: {
            create: createMock,
            findAll: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get(ReportsService);
  });

  describe('create', () => {
    it('should call service.create and return the result', async () => {
      // Arrange
      createMock.mockResolvedValue(MOCK_DTO);
      const body = {
        title: 'Buraco',
        description: 'Enorme',
        location: 'Rua X',
      };

      // Act
      const result = await controller.create(body);

      // Assert
      expect(createMock).toHaveBeenCalledWith(body);
      expect(result).toEqual(MOCK_DTO);
    });

    it('should propagate LlmUnavailableError from service', async () => {
      // Arrange
      createMock.mockRejectedValue(new LlmUnavailableError());

      // Act
      const act = () =>
        controller.create({ title: 'X', description: 'Y', location: 'Z' });

      // Assert
      await expect(act()).rejects.toThrow(LlmUnavailableError);
    });
  });

  describe('findAll', () => {
    it('should return array of reports from service', async () => {
      // Arrange
      service.findAll.mockResolvedValue([MOCK_DTO]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('uuid-123');
    });
  });

  describe('findById', () => {
    it('should return a single report', async () => {
      // Arrange
      service.findById.mockResolvedValue(MOCK_DTO);

      // Act
      const result = await controller.findById('uuid-123');

      // Assert
      expect(result.id).toBe('uuid-123');
    });

    it('should propagate NotFoundException when service throws', async () => {
      // Arrange
      service.findById.mockRejectedValue(new NotFoundException());

      // Act
      const act = () => controller.findById('non-existent');

      // Assert
      await expect(act()).rejects.toThrow(NotFoundException);
    });
  });
});
