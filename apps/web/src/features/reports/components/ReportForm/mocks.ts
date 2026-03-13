import type { Control, UseFormReturn } from "react-hook-form"
import { buildMockMutation } from "@/features/reports/testing/mocks"
import type { useReportForm } from "../../hooks/use-report-form"
import type { ReportFormValues } from "../../schemas/report.schema"
import type { CreateReportDto, ReportResponse } from "../../types/report.types"

const MOCKED_FORM: UseFormReturn<ReportFormValues> = {
  register: jest.fn().mockReturnValue({
    onChange: jest.fn(),
    onBlur: jest.fn(),
    ref: jest.fn(),
    name: "",
  }),
  handleSubmit: jest.fn().mockImplementation((fn: unknown) => fn),
  setValue: jest.fn(),
  watch: jest.fn(),
  getValues: jest.fn(),
  getFieldState: jest.fn(),
  setError: jest.fn(),
  clearErrors: jest.fn(),
  trigger: jest.fn(),
  reset: jest.fn(),
  resetField: jest.fn(),
  unregister: jest.fn(),
  setFocus: jest.fn(),
  subscribe: jest.fn(),
  control: {} as Control<ReportFormValues>,
  formState: {
    errors: {},
    dirtyFields: {},
    touchedFields: {},
    validatingFields: {},
    isDirty: false,
    isLoading: false,
    isSubmitted: false,
    isSubmitSuccessful: false,
    isSubmitting: false,
    isValid: false,
    isValidating: false,
    isReady: false,
    submitCount: 0,
    disabled: false,
  },
}

export const IDLE_HOOK_RETURN: ReturnType<typeof useReportForm> = {
  form: MOCKED_FORM,
  cepMutation: buildMockMutation<never, string>(),
  reportMutation: buildMockMutation<ReportResponse, CreateReportDto>(),
  handleCepBlur: jest.fn(),
  onSubmit: jest.fn(),
  handleNewReport: jest.fn(),
  errors: {},
  dirtyFields: {},
  locationMode: "simple" as const,
  toggleLocationMode: jest.fn(),
}
