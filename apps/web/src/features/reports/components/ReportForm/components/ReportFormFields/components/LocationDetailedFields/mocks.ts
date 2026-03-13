import type { FieldErrors } from "react-hook-form"
import type { ViaCepAddress } from "@/services/viacep"
import type { ReportFormValues } from "@/features/reports/schemas/report.schema"
import {
  buildMockMutation,
  buildMockRegister,
} from "@/features/reports/testing/mocks"

export function buildMockCepMutation(
  overrides: Parameters<
    typeof buildMockMutation<ViaCepAddress, string>
  >[0] = {},
) {
  return buildMockMutation<ViaCepAddress, string>(overrides)
}

export const DEFAULT_PROPS = {
  register: buildMockRegister(),
  errors: {} as FieldErrors<ReportFormValues>,
  cepMutation: buildMockMutation<ViaCepAddress, string>(),
  dirtyFields: {} as Partial<Record<keyof ReportFormValues, boolean>>,
  onCepBlur: jest.fn(),
  onCepChange: jest.fn(),
}
