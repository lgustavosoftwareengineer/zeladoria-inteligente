import { fireEvent, render, screen } from "@testing-library/react"
import { STUB_REPORT } from "@/features/reports/testing/stubs"
import { ReportFormSuccess } from "../ReportFormSuccess"

describe("ReportFormSuccess", () => {
  it("should display the success message", () => {
    // Arrange / Act
    render(<ReportFormSuccess report={STUB_REPORT} onNewReport={jest.fn()} />)

    // Assert
    expect(
      screen.getByText("Ocorrência registrada com sucesso!"),
    ).toBeInTheDocument()
  })

  it("should display the report protocol id", () => {
    // Arrange / Act
    render(<ReportFormSuccess report={STUB_REPORT} onNewReport={jest.fn()} />)

    // Assert
    expect(screen.getByText("abc-123")).toBeInTheDocument()
  })

  it("should display the report category", () => {
    // Arrange / Act
    render(<ReportFormSuccess report={STUB_REPORT} onNewReport={jest.fn()} />)

    // Assert
    expect(screen.getByText("Via Pública")).toBeInTheDocument()
  })

  it("should display the technical summary", () => {
    // Arrange / Act
    render(<ReportFormSuccess report={STUB_REPORT} onNewReport={jest.fn()} />)

    // Assert
    expect(
      screen.getByText(
        "Irregularidade no pavimento que representa risco à segurança.",
      ),
    ).toBeInTheDocument()
  })

  it("should render the priority badge", () => {
    // Arrange / Act
    render(<ReportFormSuccess report={STUB_REPORT} onNewReport={jest.fn()} />)

    // Assert
    expect(screen.getByText("Prioridade Alta")).toBeInTheDocument()
  })

  it("should call onNewReport when the button is clicked", () => {
    // Arrange
    const handleNewReport = jest.fn()
    render(
      <ReportFormSuccess report={STUB_REPORT} onNewReport={handleNewReport} />,
    )

    // Act
    fireEvent.click(screen.getByRole("button", { name: /registrar nova/i }))

    // Assert
    expect(handleNewReport).toHaveBeenCalledTimes(1)
  })
})
