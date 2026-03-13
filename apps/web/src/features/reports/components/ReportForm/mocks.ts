import { buildMockMutation } from "@/features/reports/testing/mocks"
import type { useReportForm } from "../../hooks/use-report-form"
import type { CreateReportDto, ReportResponse } from "../../types/report.types"

export const IDLE_HOOK_RETURN = {
  form: {
    register: jest.fn().mockReturnValue({
      onChange: jest.fn(),
      onBlur: jest.fn(),
      ref: jest.fn(),
      name: "",
    }),
    handleSubmit: jest.fn().mockImplementation((fn: unknown) => fn),
    setValue: jest.fn(),
    formState: { errors: {}, dirtyFields: {} },
  },
  cepMutation: buildMockMutation<never, string>(),
  reportMutation: buildMockMutation<ReportResponse, CreateReportDto>(),
  handleCepBlur: jest.fn(),
  onSubmit: jest.fn(),
  handleNewReport: jest.fn(),
  errors: {},
  dirtyFields: {},
  locationMode: "simple" as const,
  toggleLocationMode: jest.fn(),
} as ReturnType<typeof useReportForm>
