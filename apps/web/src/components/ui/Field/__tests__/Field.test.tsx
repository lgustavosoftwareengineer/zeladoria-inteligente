import { render, screen } from "@testing-library/react"
import { Field } from "../Field"

describe("Field", () => {
  it("should render label text", () => {
    // Arrange / Act
    render(
      <Field id="title" label="Título">
        <input id="title" />
      </Field>,
    )

    // Assert
    expect(screen.getByText("Título")).toBeInTheDocument()
  })

  it("should associate label with input via htmlFor", () => {
    // Arrange / Act
    render(
      <Field id="title" label="Título">
        <input id="title" />
      </Field>,
    )

    // Assert
    expect(screen.getByLabelText("Título")).toBeInTheDocument()
  })

  it("should show required asterisk when required is true", () => {
    // Arrange / Act
    render(
      <Field id="title" label="Título" required>
        <input id="title" />
      </Field>,
    )

    // Assert
    expect(screen.getByText("*")).toBeInTheDocument()
  })

  it("should not show asterisk when required is false", () => {
    // Arrange / Act
    render(
      <Field id="title" label="Título">
        <input id="title" />
      </Field>,
    )

    // Assert
    expect(screen.queryByText("*")).not.toBeInTheDocument()
  })

  it("should render error message with role alert", () => {
    // Arrange / Act
    render(
      <Field id="title" label="Título" error="Campo obrigatório.">
        <input id="title" />
      </Field>,
    )

    // Assert
    expect(screen.getByRole("alert")).toHaveTextContent("Campo obrigatório.")
  })

  it("should not render error element when error is undefined", () => {
    // Arrange / Act
    render(
      <Field id="title" label="Título">
        <input id="title" />
      </Field>,
    )

    // Assert
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("should render children", () => {
    // Arrange / Act
    render(
      <Field id="title" label="Título">
        <input id="title" data-testid="child-input" />
      </Field>,
    )

    // Assert
    expect(screen.getByTestId("child-input")).toBeInTheDocument()
  })
})
