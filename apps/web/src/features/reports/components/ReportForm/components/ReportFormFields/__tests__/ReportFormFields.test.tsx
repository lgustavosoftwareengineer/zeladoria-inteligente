import type { UseMutationResult } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { fireEvent } from "@testing-library/react"
import type {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form"
import type { ViaCepAddress } from "@/services/viacep"
import type { ReportFormValues } from "../../../../../schemas/report.schema"
import type {
  CreateReportDto,
  ReportResponse,
} from "../../../../../types/report.types"
import { ReportFormFields } from "../ReportFormFields"

function buildMockRegister(): UseFormRegister<ReportFormValues> {
  return jest.fn().mockReturnValue({
    name: "mock",
    onChange: jest.fn(),
    onBlur: jest.fn(),
    ref: jest.fn(),
  }) as unknown as UseFormRegister<ReportFormValues>
}

function buildMockHandleSubmit(): UseFormHandleSubmit<ReportFormValues> {
  return jest
    .fn()
    .mockImplementation(
      (fn: (values: ReportFormValues) => void) =>
        (e?: React.BaseSyntheticEvent) => {
          e?.preventDefault?.()
          fn({} as ReportFormValues)
        },
    ) as unknown as UseFormHandleSubmit<ReportFormValues>
}

function buildMockMutation<TData, TVariables>(
  overrides: Partial<UseMutationResult<TData, Error, TVariables>> = {},
): UseMutationResult<TData, Error, TVariables> {
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
  } as unknown as UseMutationResult<TData, Error, TVariables>
}

const DEFAULT_PROPS = {
  register: buildMockRegister(),
  handleSubmit: buildMockHandleSubmit(),
  onSubmit: jest.fn(),
  errors: {} as FieldErrors<ReportFormValues>,
  dirtyFields: {} as Partial<Record<keyof ReportFormValues, boolean>>,
  setValue: jest.fn() as unknown as UseFormSetValue<ReportFormValues>,
  cepMutation: buildMockMutation<ViaCepAddress, string>(),
  reportMutation: buildMockMutation<ReportResponse, CreateReportDto>(),
  handleCepBlur: jest.fn(),
  locationMode: "detailed" as const,
  onToggleLocationMode: jest.fn(),
}

describe("ReportFormFields", () => {
  it("should render the form with main fields", () => {
    // Arrange / Act
    render(<ReportFormFields {...DEFAULT_PROPS} />)

    // Assert
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descrição do problema/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cep/i)).toBeInTheDocument()
  })

  it("should render the submit button", () => {
    // Arrange / Act
    render(<ReportFormFields {...DEFAULT_PROPS} />)

    // Assert
    expect(
      screen.getByRole("button", { name: /enviar ocorrência/i }),
    ).toBeInTheDocument()
  })

  it("should show error alert when reportMutation has an error", () => {
    // Arrange
    const props = {
      ...DEFAULT_PROPS,
      reportMutation: buildMockMutation<ReportResponse, CreateReportDto>({
        isError: true,
        error: new Error("Serviço de IA indisponível."),
      }),
    }

    // Act
    render(<ReportFormFields {...props} />)

    // Assert
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Serviço de IA indisponível.",
    )
  })

  it("should not show error alert when there is no error", () => {
    // Arrange / Act
    render(<ReportFormFields {...DEFAULT_PROPS} />)

    // Assert
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("should render the location mode toggle button", () => {
    // Arrange / Act
    render(<ReportFormFields {...DEFAULT_PROPS} />)

    // Assert
    expect(
      screen.getByRole("button", { name: /usar texto livre/i }),
    ).toBeInTheDocument()
  })

  it("should render CEP input when locationMode is detailed", () => {
    // Arrange / Act
    render(<ReportFormFields {...DEFAULT_PROPS} locationMode="detailed" />)

    // Assert
    expect(screen.getByLabelText(/cep/i)).toBeInTheDocument()
  })

  it("should render locationText textarea when locationMode is simple", () => {
    // Arrange / Act
    render(<ReportFormFields {...DEFAULT_PROPS} locationMode="simple" />)

    // Assert
    expect(screen.queryByLabelText(/cep/i)).not.toBeInTheDocument()
    expect(
      screen.getAllByRole("textbox").some((el) => el.id === "locationText"),
    ).toBe(true)
  })

  it("should call onToggleLocationMode when the toggle button is clicked", () => {
    // Arrange
    const onToggleLocationMode = jest.fn()
    render(
      <ReportFormFields
        {...DEFAULT_PROPS}
        onToggleLocationMode={onToggleLocationMode}
      />,
    )

    // Act
    fireEvent.click(screen.getByRole("button", { name: /usar texto livre/i }))

    // Assert
    expect(onToggleLocationMode).toHaveBeenCalledTimes(1)
  })

  it("should show field-level error when title has an error", () => {
    // Arrange
    const props = {
      ...DEFAULT_PROPS,
      errors: {
        title: {
          message: "O título deve ter pelo menos 3 caracteres.",
          type: "too_small",
        },
      } as FieldErrors<ReportFormValues>,
    }

    // Act
    render(<ReportFormFields {...props} />)

    // Assert
    expect(
      screen.getByText("O título deve ter pelo menos 3 caracteres."),
    ).toBeInTheDocument()
  })
})
