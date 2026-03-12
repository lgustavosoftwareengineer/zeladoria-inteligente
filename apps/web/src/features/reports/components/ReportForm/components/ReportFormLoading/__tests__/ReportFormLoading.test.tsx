import { render, screen } from "@testing-library/react"
import { ReportFormLoading } from "../ReportFormLoading"

describe("ReportFormLoading", () => {
  it("should render the loading message", () => {
    // Arrange / Act
    render(<ReportFormLoading />)

    // Assert (dots are in aria-hidden span, so match main message + emoji)
    expect(
      screen.getByText((content) =>
        content.includes(
          "Espera só um momento que estamos analisando a sua ocorrência",
        ),
      ),
    ).toBeInTheDocument()
  })

  it("should render the secondary hint text", () => {
    // Arrange / Act
    render(<ReportFormLoading />)

    // Assert
    expect(
      screen.getByText("Isso pode levar alguns segundos."),
    ).toBeInTheDocument()
  })
})
