import { fireEvent, render, screen } from "@testing-library/react"
import type { ReportResponse } from "../../../../../types/report.types"
import { ReportFormSuccess } from "../ReportFormSuccess"

const MOCK_REPORT: ReportResponse = {
  id: "abc-123",
  title: "Buraco na rua",
  description: "Há um buraco enorme na calçada.",
  location: "Praça da Sé, 1, Sé, São Paulo - SP, CEP 01001-000",
  category: "Via Pública",
  priority: "Alta",
  technicalSummary:
    "Irregularidade no pavimento que representa risco à segurança.",
  createdAt: "2026-03-12T00:00:00.000Z",
}

describe("ReportFormSuccess", () => {
  it("should display the success message", () => {
    // Arrange / Act
    render(<ReportFormSuccess report={MOCK_REPORT} onNewReport={jest.fn()} />)

    // Assert
    expect(
      screen.getByText("Ocorrência registrada com sucesso!"),
    ).toBeInTheDocument()
  })

  it("should display the report protocol id", () => {
    // Arrange / Act
    render(<ReportFormSuccess report={MOCK_REPORT} onNewReport={jest.fn()} />)

    // Assert
    expect(screen.getByText("abc-123")).toBeInTheDocument()
  })

  it("should display the report category", () => {
    // Arrange / Act
    render(<ReportFormSuccess report={MOCK_REPORT} onNewReport={jest.fn()} />)

    // Assert
    expect(screen.getByText("Via Pública")).toBeInTheDocument()
  })

  it("should display the technical summary", () => {
    // Arrange / Act
    render(<ReportFormSuccess report={MOCK_REPORT} onNewReport={jest.fn()} />)

    // Assert
    expect(
      screen.getByText(
        "Irregularidade no pavimento que representa risco à segurança.",
      ),
    ).toBeInTheDocument()
  })

  it("should render the priority badge", () => {
    // Arrange / Act
    render(<ReportFormSuccess report={MOCK_REPORT} onNewReport={jest.fn()} />)

    // Assert
    expect(screen.getByText("Prioridade Alta")).toBeInTheDocument()
  })

  it("should call onNewReport when the button is clicked", () => {
    // Arrange
    const handleNewReport = jest.fn()
    render(
      <ReportFormSuccess report={MOCK_REPORT} onNewReport={handleNewReport} />,
    )

    // Act
    fireEvent.click(screen.getByRole("button", { name: /registrar nova/i }))

    // Assert
    expect(handleNewReport).toHaveBeenCalledTimes(1)
  })
})
