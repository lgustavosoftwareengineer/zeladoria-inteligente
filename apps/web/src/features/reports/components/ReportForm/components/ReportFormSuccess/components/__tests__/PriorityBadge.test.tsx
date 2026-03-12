import { render, screen } from "@testing-library/react"
import { PriorityBadge } from "../PriorityBadge"

describe("PriorityBadge", () => {
  it("should display the priority label", () => {
    // Arrange / Act
    render(<PriorityBadge priority="Alta" />)

    // Assert
    expect(screen.getByText("Prioridade Alta")).toBeInTheDocument()
  })

  it("should render with danger styles for Alta", () => {
    // Arrange / Act
    render(<PriorityBadge priority="Alta" />)

    // Assert
    expect(screen.getByText("Prioridade Alta")).toHaveClass("text-red-700")
  })

  it("should render with warn styles for Média", () => {
    // Arrange / Act
    render(<PriorityBadge priority="Média" />)

    // Assert
    expect(screen.getByText("Prioridade Média")).toHaveClass("text-yellow-700")
  })

  it("should render with success styles for Baixa", () => {
    // Arrange / Act
    render(<PriorityBadge priority="Baixa" />)

    // Assert
    expect(screen.getByText("Prioridade Baixa")).toHaveClass("text-green-700")
  })
})
