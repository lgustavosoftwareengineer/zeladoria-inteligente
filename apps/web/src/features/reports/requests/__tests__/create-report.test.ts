import type { CreateReportDto, ReportResponse } from "../../types/report.types"
import { createReport } from "../create-report"

const MOCK_DTO: CreateReportDto = {
  title: "Buraco na rua",
  description: "Há um buraco enorme na calçada.",
  location: "Praça da Sé, 1, Sé, São Paulo - SP, CEP 01001-000",
}

const MOCK_RESPONSE: ReportResponse = {
  id: "abc-123",
  title: "Buraco na rua",
  description: "Há um buraco enorme na calçada.",
  location: "Praça da Sé, 1, Sé, São Paulo - SP, CEP 01001-000",
  category: "Via Pública",
  priority: "Alta",
  technicalSummary: "Irregularidade no pavimento.",
  createdAt: "2026-03-12T00:00:00.000Z",
}

describe("createReport", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("should return the enriched report on success", async () => {
    // Arrange
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_RESPONSE),
    } as Response)

    // Act
    const result = await createReport(MOCK_DTO)

    // Assert
    expect(result).toEqual(MOCK_RESPONSE)
  })

  it("should POST to /api/reports with JSON body", async () => {
    // Arrange
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_RESPONSE),
    } as Response)

    // Act
    await createReport(MOCK_DTO)

    // Assert
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/reports"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(MOCK_DTO),
      }),
    )
  })

  it("should throw with the API error message on non-ok response", async () => {
    // Arrange
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Serviço de IA indisponível." }),
    } as Response)

    // Act
    const act = () => createReport(MOCK_DTO)

    // Assert
    await expect(act()).rejects.toThrow("Serviço de IA indisponível.")
  })

  it("should throw fallback message when error response has no message", async () => {
    // Arrange
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.reject(new Error("invalid json")),
    } as Response)

    // Act
    const act = () => createReport(MOCK_DTO)

    // Assert
    await expect(act()).rejects.toThrow("Serviço temporariamente indisponível.")
  })
})
