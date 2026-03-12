import { render, screen, fireEvent } from "@testing-library/react"
import { LocationDetailedFields } from "../LocationDetailedFields"
import type { ReportFormValues } from "../../../../../../schemas/report.schema"
import type { ViaCepAddress } from "@/services/viacep"
import type { UseMutationResult } from "@tanstack/react-query"
import type { FieldErrors, UseFormRegister } from "react-hook-form"

function buildMockRegister(): UseFormRegister<ReportFormValues> {
  return jest
    .fn()
    .mockImplementation(
      (
        _name: string,
        opts?: { onBlur?: () => void; onChange?: () => void },
      ) => ({
        name: _name,
        onChange: opts?.onChange ?? jest.fn(),
        onBlur: opts?.onBlur ?? jest.fn(),
        ref: jest.fn(),
      }),
    ) as unknown as UseFormRegister<ReportFormValues>
}

function buildMockCepMutation(
  overrides: Partial<UseMutationResult<ViaCepAddress, Error, string>> = {},
): UseMutationResult<ViaCepAddress, Error, string> {
  return {
    isPending: false,
    isSuccess: false,
    isError: false,
    isIdle: true,
    data: undefined,
    error: null,
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    reset: jest.fn(),
    status: "idle",
    variables: undefined,
    failureCount: 0,
    failureReason: null,
    submittedAt: 0,
    context: undefined,
    ...overrides,
  } as unknown as UseMutationResult<ViaCepAddress, Error, string>
}

const DEFAULT_PROPS = {
  register: buildMockRegister(),
  errors: {} as FieldErrors<ReportFormValues>,
  cepMutation: buildMockCepMutation(),
  dirtyFields: {} as Partial<Record<keyof ReportFormValues, boolean>>,
  onCepBlur: jest.fn(),
  onCepChange: jest.fn(),
}

describe("LocationDetailedFields", () => {
  it("should render all address fields", () => {
    // Arrange / Act
    render(<LocationDetailedFields {...DEFAULT_PROPS} />)

    // Assert
    expect(screen.getByLabelText(/cep/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/número/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/rua/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/complemento/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/bairro/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cidade/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/uf/i)).toBeInTheDocument()
  })

  it("should call onCepBlur when CEP input loses focus", () => {
    // Arrange
    const onCepBlur = jest.fn()
    render(<LocationDetailedFields {...DEFAULT_PROPS} onCepBlur={onCepBlur} />)
    const cepInput = screen.getByLabelText(/cep/i)

    // Act
    fireEvent.blur(cepInput)

    // Assert
    expect(onCepBlur).toHaveBeenCalledTimes(1)
  })

  it("should call onCepChange when CEP input value changes", () => {
    // Arrange
    const onCepChange = jest.fn()
    render(
      <LocationDetailedFields {...DEFAULT_PROPS} onCepChange={onCepChange} />,
    )
    const cepInput = screen.getByLabelText(/cep/i)

    // Act
    fireEvent.change(cepInput, { target: { value: "01001-000" } })

    // Assert
    expect(onCepChange).toHaveBeenCalledTimes(1)
  })

  it("should show CEP loading spinner when cepMutation is pending", () => {
    // Arrange
    const props = {
      ...DEFAULT_PROPS,
      cepMutation: buildMockCepMutation({ isPending: true }),
    }

    // Act
    render(<LocationDetailedFields {...props} />)

    // Assert
    const cepContainer = screen
      .getByLabelText(/cep/i)
      .closest("div")?.parentElement
    expect(cepContainer?.querySelector("[aria-hidden]")).toBeInTheDocument()
  })

  it("should show field error when CEP has error", () => {
    // Arrange
    const props = {
      ...DEFAULT_PROPS,
      errors: {
        cep: {
          message: "CEP inválido.",
          type: "invalid",
        },
      } as FieldErrors<ReportFormValues>,
    }

    // Act
    render(<LocationDetailedFields {...props} />)

    // Assert
    expect(screen.getByText("CEP inválido.")).toBeInTheDocument()
  })

  it("should show field error when street has error", () => {
    // Arrange
    const props = {
      ...DEFAULT_PROPS,
      errors: {
        street: {
          message: "A rua é obrigatória.",
          type: "required",
        },
      } as FieldErrors<ReportFormValues>,
    }

    // Act
    render(<LocationDetailedFields {...props} />)

    // Assert
    expect(screen.getByText("A rua é obrigatória.")).toBeInTheDocument()
  })

  it("should render street input as readOnly when CEP was successful and cep is dirty", () => {
    // Arrange
    const props = {
      ...DEFAULT_PROPS,
      cepMutation: buildMockCepMutation({ isSuccess: true }),
      dirtyFields: { cep: true } as Partial<
        Record<keyof ReportFormValues, boolean>
      >,
    }

    // Act
    render(<LocationDetailedFields {...props} />)

    // Assert
    const streetInput = screen.getByLabelText(/rua/i)
    expect(streetInput).toHaveAttribute("readonly")
  })

  it("should not render street as readOnly when CEP mutation is not success", () => {
    // Arrange
    const props = {
      ...DEFAULT_PROPS,
      cepMutation: buildMockCepMutation({ isSuccess: false }),
      dirtyFields: { cep: true } as Partial<
        Record<keyof ReportFormValues, boolean>
      >,
    }

    // Act
    render(<LocationDetailedFields {...props} />)

    // Assert
    const streetInput = screen.getByLabelText(/rua/i)
    expect(streetInput).not.toHaveAttribute("readonly")
  })
})
