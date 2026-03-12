import { render, screen } from "@testing-library/react"
import { Badge } from "../Badge"

describe("Badge", () => {
  it("should render children", () => {
    // Arrange / Act
    render(<Badge type="success">Baixa</Badge>)

    // Assert
    expect(screen.getByText("Baixa")).toBeInTheDocument()
  })

  it("should apply danger styles for type danger", () => {
    // Arrange / Act
    render(<Badge type="danger">Alta</Badge>)

    // Assert
    expect(screen.getByText("Alta")).toHaveClass("text-red-700")
  })

  it("should apply warn styles for type warn", () => {
    // Arrange / Act
    render(<Badge type="warn">Média</Badge>)

    // Assert
    expect(screen.getByText("Média")).toHaveClass("text-yellow-700")
  })

  it("should apply success styles for type success", () => {
    // Arrange / Act
    render(<Badge type="success">Baixa</Badge>)

    // Assert
    expect(screen.getByText("Baixa")).toHaveClass("text-green-700")
  })

  it("should merge custom className", () => {
    // Arrange / Act
    render(
      <Badge type="success" className="my-custom-class">
        Baixa
      </Badge>,
    )

    // Assert
    expect(screen.getByText("Baixa")).toHaveClass("my-custom-class")
  })
})
