import { render, screen } from "@testing-library/react"
import { useReportForm } from "@/features/reports/hooks/use-report-form"
import { buildMockMutation } from "@/features/reports/testing/mocks"
import { STUB_REPORT } from "@/features/reports/testing/stubs"
import type {
  CreateReportDto,
  ReportResponse,
} from "@/features/reports/types/report.types"
import { IDLE_HOOK_RETURN } from "../mocks"
import { ReportForm } from "../ReportForm"

jest.mock("@/features/reports/hooks/use-report-form")

const mockUseReportForm = useReportForm as jest.MockedFunction<
  typeof useReportForm
>

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
        data: STUB_REPORT,
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
