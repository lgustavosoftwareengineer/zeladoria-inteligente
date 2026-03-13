import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { UseMutationResult } from "@tanstack/react-query"
import { render } from "@testing-library/react"
import type { ReactElement } from "react"
import type { UseFormRegister } from "react-hook-form"
import type { ReportFormValues } from "../schemas/report.schema"

export function buildMockMutation<TData, TVariables>(
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

export function buildMockRegister(): UseFormRegister<ReportFormValues> {
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

export function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}
