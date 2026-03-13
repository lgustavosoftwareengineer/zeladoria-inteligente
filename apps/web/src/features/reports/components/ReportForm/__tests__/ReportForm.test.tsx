import type { UseMutationResult } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { useReportForm } from "../../../hooks/use-report-form"
import type {
  CreateReportDto,
  ReportResponse,
} from "../../../types/report.types"
import { ReportForm } from "../ReportForm"

jest.mock("../../../hooks/use-report-form")

const mockUseReportForm = useReportForm as jest.MockedFunction<
  typeof useReportForm
>

function buildMockMutation<TData, TVariables>(
  overrides: Partial<UseMutationResult<TData, Error, TVariables>> = {},
): UseMutationResult<TData, Error, TVariables> {
  return {
    isPending: false,
    isSuccess: false,
    isError: false,
    isIdle: true,
    data: undefined,
    error: null,
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    reset: jest.fn(),
    status: "idle",
    variables: undefined,
    failureCount: 0,
    failureReason: null,
    submittedAt: 0,
    context: undefined,
    ...overrides,
  } as unknown as UseMutationResult<TData, Error, TVariables>
}

const IDLE_HOOK_RETURN = {
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
} as unknown as ReturnType<typeof useReportForm>

const MOCK_REPORT: ReportResponse = {
  id: "abc-123",
  title: "Buraco na rua",
  description: "Há um buraco enorme na calçada.",
  location: "Praça da Sé, 1",
  category: "Via Pública",
  priority: "Alta",
  technicalSummary: "Irregularidade no pavimento.",
  createdAt: "2026-03-12T00:00:00.000Z",
}

describe("ReportForm", () => {
  beforeEach(() => {
    mockUseReportForm.mockReturnValue(IDLE_HOOK_RETURN)
  })

  it("should render the form fields by default", () => {
    // Arrange / Act
    render(<ReportForm />)

    // Assert
    expect(
      screen.getByRole("button", { name: /enviar ocorrência/i }),
    ).toBeInTheDocument()
  })

  it("should render loading state when mutation is pending", () => {
    // Arrange
    mockUseReportForm.mockReturnValue({
      ...IDLE_HOOK_RETURN,
      reportMutation: buildMockMutation<ReportResponse, CreateReportDto>({
        isPending: true,
      }),
    })

    // Act
    render(<ReportForm />)

    // Assert
    expect(
      screen.getByText((content) =>
        content.includes(
          "Espera só um momento que estamos analisando a sua ocorrência",
        ),
      ),
    ).toBeInTheDocument()
  })

  it("should render success state when mutation succeeds", () => {
    // Arrange
    mockUseReportForm.mockReturnValue({
      ...IDLE_HOOK_RETURN,
      reportMutation: buildMockMutation<ReportResponse, CreateReportDto>({
        isSuccess: true,
        data: MOCK_REPORT,
      }),
    })

    // Act
    render(<ReportForm />)

    // Assert
    expect(
      screen.getByText("Ocorrência registrada com sucesso!"),
    ).toBeInTheDocument()
  })
})
