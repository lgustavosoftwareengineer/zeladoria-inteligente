import { render, screen } from "@testing-library/react"
import { Textarea } from "../Textarea"

describe("Textarea", () => {
  it("should render a textarea element", () => {
    // Arrange / Act
    render(<Textarea />)

    // Assert
    expect(screen.getByRole("textbox")).toBeInTheDocument()
  })

  it("should apply default border styles", () => {
    // Arrange / Act
    render(<Textarea />)

    // Assert
    expect(screen.getByRole("textbox")).toHaveClass("border-gray-300")
  })

  it("should apply readOnly styles when readOnly is true", () => {
    // Arrange / Act
    render(<Textarea readOnly />)

    // Assert
    expect(screen.getByRole("textbox")).toHaveClass("bg-blue-50")
  })

  it("should not apply readOnly styles when readOnly is false", () => {
    // Arrange / Act
    render(<Textarea readOnly={false} />)

    // Assert
    expect(screen.getByRole("textbox")).not.toHaveClass("bg-blue-50")
  })

  it("should forward rows attribute", () => {
    // Arrange / Act
    render(<Textarea rows={4} />)

    // Assert
    expect(screen.getByRole("textbox")).toHaveAttribute("rows", "4")
  })
})
