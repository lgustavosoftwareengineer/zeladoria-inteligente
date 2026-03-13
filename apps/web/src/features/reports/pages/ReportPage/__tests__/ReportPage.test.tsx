"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { fetchAddressByCep } from "@/services/viacep"
import { createReport } from "../../../requests/create-report"
import { ReportPage } from "../ReportPage"

jest.mock("../../../requests/create-report")
jest.mock("@/services/viacep")

const mockCreateReport = createReport as jest.MockedFunction<
  typeof createReport
>
const mockFetchAddressByCep = fetchAddressByCep as jest.MockedFunction<
  typeof fetchAddressByCep
>

const MOCK_REPORT = {
  id: "uuid-001",
  title: "Buraco na calçada",
  description: "Há um buraco enorme e perigoso na calçada principal.",
  location: "Praça da Sé, 10, Sé, São Paulo - SP, CEP 01001-000",
  category: "Via Pública",
  priority: "Alta" as const,
  technicalSummary: "Irregularidade no pavimento com risco de queda.",
  createdAt: "2026-03-12T00:00:00.000Z",
}

const MOCK_ADDRESS = {
  street: "Praça da Sé",
  neighborhood: "Sé",
  city: "São Paulo",
  state: "SP",
}

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <ReportPage />
    </QueryClientProvider>,
  )
}

function getSubmitForm() {
  return screen.getByRole("button", { name: /enviar/i }).closest("form")!
}

function switchToDetailedLocation() {
  fireEvent.click(
    screen.getByRole("button", { name: /usar endereço detalhado/i }),
  )
}

async function fillRequiredFields() {
  await userEvent.type(screen.getByLabelText(/título/i), "Buraco na calçada")
  await userEvent.type(
    screen.getByLabelText(/descrição do problema/i),
    "Há um buraco enorme e perigoso na calçada principal.",
  )
  switchToDetailedLocation()
  // fireEvent.change bypasses the CEP mask handler and directly updates RHF state
  fireEvent.change(screen.getByLabelText(/cep/i), {
    target: { value: "01001-000" },
  })
  await userEvent.type(screen.getByLabelText(/número/i), "10")
  await userEvent.type(screen.getByLabelText(/rua/i), "Praça da Sé")
  await userEvent.type(screen.getByLabelText(/bairro/i), "Sé")
  await userEvent.type(screen.getByLabelText(/cidade/i), "São Paulo")
  await userEvent.type(screen.getByLabelText(/uf/i), "SP")
}

describe("ReportPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetchAddressByCep.mockResolvedValue(MOCK_ADDRESS)
  })

  describe("given the citizen opens the form", () => {
    it("should display all required fields ready to be filled", () => {
      // Arrange / Act
      renderWithProviders()
      switchToDetailedLocation()

      // Assert
      expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
      expect(
        screen.getByLabelText(/descrição do problema/i),
      ).toBeInTheDocument()
      expect(screen.getByLabelText(/cep/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/número/i)).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: /enviar ocorrência/i }),
      ).toBeInTheDocument()
    })
  })

  describe("given the citizen fills all required fields and submits", () => {
    it("should show a loading indicator while the AI processes the report", async () => {
      // Arrange — a never-resolving promise keeps the mutation in pending state
      mockCreateReport.mockImplementation(() => new Promise(() => {}))
      renderWithProviders()
      await fillRequiredFields()

      // Act
      fireEvent.submit(getSubmitForm())

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText((content) =>
            content.includes(
              "Espera só um momento que estamos analisando a sua ocorrência",
            ),
          ),
        ).toBeInTheDocument()
      })
    })

    it("should display the AI-enriched report after successful submission", async () => {
      // Arrange
      mockCreateReport.mockResolvedValue(MOCK_REPORT)
      renderWithProviders()
      await fillRequiredFields()

      // Act
      fireEvent.submit(getSubmitForm())

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText("Ocorrência registrada com sucesso!"),
        ).toBeInTheDocument()
      })
      expect(screen.getByText("uuid-001")).toBeInTheDocument()
      expect(screen.getByText("Via Pública")).toBeInTheDocument()
      expect(screen.getByText("Prioridade Alta")).toBeInTheDocument()
      expect(
        screen.getByText("Irregularidade no pavimento com risco de queda."),
      ).toBeInTheDocument()
    })
  })

  describe("given the citizen submits the form without filling required fields", () => {
    it("should display validation errors and not call the API", async () => {
      // Arrange
      renderWithProviders()

      // Act
      fireEvent.submit(getSubmitForm())

      // Assert
      await waitFor(() => {
        expect(screen.getAllByRole("alert").length).toBeGreaterThan(0)
      })
      expect(mockCreateReport).not.toHaveBeenCalled()
    })
  })

  describe("given the API fails to process the report", () => {
    it("should display a descriptive error message to the citizen", async () => {
      // Arrange
      mockCreateReport.mockRejectedValue(
        new Error("Serviço de IA indisponível."),
      )
      renderWithProviders()
      await fillRequiredFields()

      // Act
      fireEvent.submit(getSubmitForm())

      // Assert
      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Serviço de IA indisponível.",
        )
      })
    })

    it("should keep the form visible so the citizen can try again", async () => {
      // Arrange
      mockCreateReport.mockRejectedValue(
        new Error("Serviço de IA indisponível."),
      )
      renderWithProviders()
      await fillRequiredFields()

      // Act
      fireEvent.submit(getSubmitForm())

      // Assert
      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument()
      })
      expect(
        screen.getByRole("button", { name: /enviar ocorrência/i }),
      ).toBeInTheDocument()
    })
  })

  describe("given the citizen enters a valid CEP", () => {
    it("should auto-populate street, neighborhood, city and state fields", async () => {
      // Arrange
      renderWithProviders()
      switchToDetailedLocation()
      const cepInput = screen.getByLabelText(/cep/i)

      // Act
      await userEvent.type(cepInput, "01001000")
      fireEvent.blur(cepInput)

      // Assert — react-query v5 passes a context object as second arg, so we only check the first
      await waitFor(() => {
        expect(mockFetchAddressByCep.mock.calls[0][0]).toBe("01001000")
      })
    })
  })

  describe("given the citizen switches to simple location mode", () => {
    it("should hide address fields and show a free-text location input", async () => {
      // Arrange
      renderWithProviders()
      switchToDetailedLocation()

      // Act
      fireEvent.click(screen.getByRole("button", { name: /usar texto livre/i }))

      // Assert
      await waitFor(() => {
        expect(screen.queryByLabelText(/cep/i)).not.toBeInTheDocument()
        expect(screen.getByLabelText(/localização/i)).toBeInTheDocument()
      })
    })

    it("should submit with the free-text location when the form is valid", async () => {
      // Arrange
      mockCreateReport.mockResolvedValue(MOCK_REPORT)
      renderWithProviders()
      switchToDetailedLocation()
      fireEvent.click(screen.getByRole("button", { name: /usar texto livre/i }))

      await userEvent.type(screen.getByLabelText(/título/i), "Buraco na rua")
      await userEvent.type(
        screen.getByLabelText(/descrição do problema/i),
        "Há um buraco enorme e perigoso na calçada principal.",
      )
      await userEvent.type(
        screen.getByLabelText(/localização/i),
        "Próximo ao terminal de ônibus central, bairro Centro",
      )

      // Act
      fireEvent.submit(getSubmitForm())

      // Assert — react-query v5 passes a context object as second arg, so we check the first only
      await waitFor(() => {
        expect(mockCreateReport.mock.calls[0][0]).toMatchObject({
          location: "Próximo ao terminal de ônibus central, bairro Centro",
        })
      })
    })
  })

  describe("given the citizen completes a submission and wants to report again", () => {
    it("should reset the form when clicking 'Registrar nova ocorrência'", async () => {
      // Arrange
      mockCreateReport.mockResolvedValue(MOCK_REPORT)
      renderWithProviders()
      await fillRequiredFields()
      fireEvent.submit(getSubmitForm())
      await waitFor(() => {
        expect(
          screen.getByText("Ocorrência registrada com sucesso!"),
        ).toBeInTheDocument()
      })

      // Act
      fireEvent.click(screen.getByRole("button", { name: /registrar nova/i }))

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /enviar ocorrência/i }),
        ).toBeInTheDocument()
      })
    })
  })
})
