import { fireEvent, render, screen } from "@testing-library/react"
import { Button } from "../Button"

describe("Button", () => {
  it("should render children", () => {
    // Arrange / Act
    render(<Button>Enviar</Button>)

    // Assert
    expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument()
  })

  it("should apply primary styles by default", () => {
    // Arrange / Act
    render(<Button>Enviar</Button>)

    // Assert
    expect(screen.getByRole("button")).toHaveClass("bg-blue-600")
  })

  it("should apply secondary styles when variant is secondary", () => {
    // Arrange / Act
    render(<Button variant="secondary">Cancelar</Button>)

    // Assert
    expect(screen.getByRole("button")).toHaveClass("border-gray-300")
  })

  it("should call onClick when clicked", () => {
    // Arrange
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Enviar</Button>)

    // Act
    fireEvent.click(screen.getByRole("button"))

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("should be disabled when disabled prop is passed", () => {
    // Arrange / Act
    render(<Button disabled>Enviar</Button>)

    // Assert
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("should forward type attribute", () => {
    // Arrange / Act
    render(<Button type="submit">Enviar</Button>)

    // Assert
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit")
  })
})
