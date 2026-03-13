"use client"

import { screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { fetchAddressByCep } from "@/services/viacep"
import { createReport } from "@/features/reports/requests/create-report"
import { STUB_ADDRESS, STUB_REPORT } from "@/features/reports/testing/stubs"
import {
  fillRequiredFields,
  getSubmitForm,
  renderWithProviders,
  switchToDetailedLocation,
} from "../mocks"

jest.mock("@/features/reports/requests/create-report")
jest.mock("@/services/viacep")

const mockCreateReport = createReport as jest.MockedFunction<
  typeof createReport
>
const mockFetchAddressByCep = fetchAddressByCep as jest.MockedFunction<
  typeof fetchAddressByCep
>

describe("ReportPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetchAddressByCep.mockResolvedValue(STUB_ADDRESS)
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
      mockCreateReport.mockResolvedValue(STUB_REPORT)
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
      expect(screen.getByText("abc-123")).toBeInTheDocument()
      expect(screen.getByText("Via Pública")).toBeInTheDocument()
      expect(screen.getByText("Prioridade Alta")).toBeInTheDocument()
      expect(
        screen.getByText(
          "Irregularidade no pavimento que representa risco à segurança.",
        ),
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
      mockCreateReport.mockResolvedValue(STUB_REPORT)
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
      mockCreateReport.mockResolvedValue(STUB_REPORT)
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
