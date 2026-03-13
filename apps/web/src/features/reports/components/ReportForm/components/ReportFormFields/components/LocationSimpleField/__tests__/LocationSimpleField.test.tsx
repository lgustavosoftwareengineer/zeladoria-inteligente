import { render, screen } from "@testing-library/react"
import type { UseFormRegister } from "react-hook-form"
import type { ReportFormValues } from "../../../../../../schemas/report.schema"
import { LocationSimpleField } from "../LocationSimpleField"

function buildMockRegister(): UseFormRegister<ReportFormValues> {
  return jest.fn().mockReturnValue({
    name: "locationText",
    onChange: jest.fn(),
    onBlur: jest.fn(),
    ref: jest.fn(),
  }) as unknown as UseFormRegister<ReportFormValues>
}

describe("LocationSimpleField", () => {
  it("should render the location textarea with placeholder", () => {
    // Arrange / Act
    render(<LocationSimpleField register={buildMockRegister()} />)

    // Assert
    const textarea = screen.getByRole("textbox")
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute("id", "locationText")
    expect(textarea).toHaveAttribute(
      "placeholder",
      "Ex: Rua das Flores, próximo ao número 900, bairro Centro",
    )
  })

  it("should not show error message when error prop is undefined", () => {
    // Arrange / Act
    render(<LocationSimpleField register={buildMockRegister()} />)

    // Assert
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("should show error message when error prop is provided", () => {
    // Arrange
    const errorMessage = "A localização deve ter pelo menos 3 caracteres."

    // Act
    render(
      <LocationSimpleField
        register={buildMockRegister()}
        error={errorMessage}
      />,
    )

    // Assert
    const alert = screen.getByRole("alert")
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent(errorMessage)
    expect(alert).toHaveAttribute("id", "locationText-error")
  })

  it("should set aria-invalid on textarea when error is provided", () => {
    // Arrange / Act
    render(
      <LocationSimpleField
        register={buildMockRegister()}
        error="Campo obrigatório."
      />,
    )

    // Assert
    const textarea = screen.getByRole("textbox")
    expect(textarea).toHaveAttribute("aria-invalid", "true")
  })

  it("should set aria-describedby when error is provided", () => {
    // Arrange / Act
    render(
      <LocationSimpleField
        register={buildMockRegister()}
        error="Campo obrigatório."
      />,
    )

    // Assert
    const textarea = screen.getByRole("textbox")
    expect(textarea).toHaveAttribute("aria-describedby", "locationText-error")
  })
})
