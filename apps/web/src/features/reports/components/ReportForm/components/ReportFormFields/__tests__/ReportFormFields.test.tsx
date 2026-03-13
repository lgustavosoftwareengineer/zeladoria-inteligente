import { render, screen } from "@testing-library/react"
import { fireEvent } from "@testing-library/react"
import type { FieldErrors } from "react-hook-form"
import type { ReportFormValues } from "@/features/reports/schemas/report.schema"
import { buildMockMutation } from "@/features/reports/testing/mocks"
import type {
  CreateReportDto,
  ReportResponse,
} from "@/features/reports/types/report.types"
import { DEFAULT_PROPS } from "../mocks"
import { ReportFormFields } from "../ReportFormFields"

describe("ReportFormFields", () => {
  it("should render the form with main fields", () => {
    // Arrange / Act
    render(<ReportFormFields {...DEFAULT_PROPS} />)

    // Assert
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descrição do problema/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cep/i)).toBeInTheDocument()
  })

  it("should render the submit button", () => {
    // Arrange / Act
    render(<ReportFormFields {...DEFAULT_PROPS} />)

    // Assert
    expect(
      screen.getByRole("button", { name: /enviar ocorrência/i }),
    ).toBeInTheDocument()
  })

  it("should show error alert when reportMutation has an error", () => {
    // Arrange
    const props = {
      ...DEFAULT_PROPS,
      reportMutation: buildMockMutation<ReportResponse, CreateReportDto>({
        isError: true,
        error: new Error("Serviço de IA indisponível."),
      }),
    }

    // Act
    render(<ReportFormFields {...props} />)

    // Assert
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Serviço de IA indisponível.",
    )
  })

  it("should not show error alert when there is no error", () => {
    // Arrange / Act
    render(<ReportFormFields {...DEFAULT_PROPS} />)

    // Assert
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("should render the location mode toggle button", () => {
    // Arrange / Act
    render(<ReportFormFields {...DEFAULT_PROPS} />)

    // Assert
    expect(
      screen.getByRole("button", { name: /usar texto livre/i }),
    ).toBeInTheDocument()
  })

  it("should render CEP input when locationMode is detailed", () => {
    // Arrange / Act
    render(<ReportFormFields {...DEFAULT_PROPS} locationMode="detailed" />)

    // Assert
    expect(screen.getByLabelText(/cep/i)).toBeInTheDocument()
  })

  it("should render locationText textarea when locationMode is simple", () => {
    // Arrange / Act
    render(<ReportFormFields {...DEFAULT_PROPS} locationMode="simple" />)

    // Assert
    expect(screen.queryByLabelText(/cep/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/localização/i)).toBeInTheDocument()
  })

  it("should call onToggleLocationMode when the toggle button is clicked", () => {
    // Arrange
    const onToggleLocationMode = jest.fn()
    render(
      <ReportFormFields
        {...DEFAULT_PROPS}
        onToggleLocationMode={onToggleLocationMode}
      />,
    )

    // Act
    fireEvent.click(screen.getByRole("button", { name: /usar texto livre/i }))

    // Assert
    expect(onToggleLocationMode).toHaveBeenCalledTimes(1)
  })

  it("should show field-level error when title has an error", () => {
    // Arrange
    const props = {
      ...DEFAULT_PROPS,
      errors: {
        title: {
          message: "O título deve ter pelo menos 3 caracteres.",
          type: "too_small",
        },
      } as FieldErrors<ReportFormValues>,
    }

    // Act
    render(<ReportFormFields {...props} />)

    // Assert
    expect(
      screen.getByText("O título deve ter pelo menos 3 caracteres."),
    ).toBeInTheDocument()
  })
})
