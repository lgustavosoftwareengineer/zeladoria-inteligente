import type {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormSetValue,
} from "react-hook-form"
import type { ViaCepAddress } from "@/services/viacep"
import type { ReportFormValues } from "@/features/reports/schemas/report.schema"
import {
  buildMockMutation,
  buildMockRegister,
} from "@/features/reports/testing/mocks"
import type {
  CreateReportDto,
  ReportResponse,
} from "@/features/reports/types/report.types"

export function buildMockHandleSubmit(): UseFormHandleSubmit<ReportFormValues> {
  return jest
    .fn()
    .mockImplementation(
      (fn: (values: ReportFormValues) => void) =>
        (e?: React.BaseSyntheticEvent) => {
          e?.preventDefault?.()
          fn({} as ReportFormValues)
        },
    ) as unknown as UseFormHandleSubmit<ReportFormValues>
}

export const DEFAULT_PROPS = {
  register: buildMockRegister(),
  handleSubmit: buildMockHandleSubmit(),
  onSubmit: jest.fn(),
  errors: {} as FieldErrors<ReportFormValues>,
  dirtyFields: {} as Partial<Record<keyof ReportFormValues, boolean>>,
  setValue: jest.fn() as unknown as UseFormSetValue<ReportFormValues>,
  cepMutation: buildMockMutation<ViaCepAddress, string>(),
  reportMutation: buildMockMutation<ReportResponse, CreateReportDto>(),
  handleCepBlur: jest.fn(),
  locationMode: "detailed" as const,
  onToggleLocationMode: jest.fn(),
}
