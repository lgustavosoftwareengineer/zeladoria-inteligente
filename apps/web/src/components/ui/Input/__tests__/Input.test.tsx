import { render, screen } from "@testing-library/react"
import { Input } from "../Input"

describe("Input", () => {
  it("should render an input element", () => {
    // Arrange / Act
    render(<Input />)

    // Assert
    expect(screen.getByRole("textbox")).toBeInTheDocument()
  })

  it("should apply default border styles", () => {
    // Arrange / Act
    render(<Input />)

    // Assert
    expect(screen.getByRole("textbox")).toHaveClass("border-gray-300")
  })

  it("should apply readOnly styles when readOnly is true", () => {
    // Arrange / Act
    render(<Input readOnly />)

    // Assert
    expect(screen.getByRole("textbox")).toHaveClass("bg-blue-50")
  })

  it("should not apply readOnly styles when readOnly is false", () => {
    // Arrange / Act
    render(<Input readOnly={false} />)

    // Assert
    expect(screen.getByRole("textbox")).not.toHaveClass("bg-blue-50")
  })

  it("should forward placeholder", () => {
    // Arrange / Act
    render(<Input placeholder="Digite aqui..." />)

    // Assert
    expect(screen.getByPlaceholderText("Digite aqui...")).toBeInTheDocument()
  })

  it("should merge custom className", () => {
    // Arrange / Act
    render(<Input className="my-extra-class" />)

    // Assert
    expect(screen.getByRole("textbox")).toHaveClass("my-extra-class")
  })
})
