import { STUB_DTO, STUB_RESPONSE } from "@/features/reports/testing/stubs"
import { createReport } from "../create-report"

describe("createReport", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("should return the enriched report on success", async () => {
    // Arrange
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(STUB_RESPONSE),
    } as Response)

    // Act
    const result = await createReport(STUB_DTO)

    // Assert
    expect(result).toEqual(STUB_RESPONSE)
  })

  it("should POST to /api/reports with JSON body", async () => {
    // Arrange
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(STUB_RESPONSE),
    } as Response)

    // Act
    await createReport(STUB_DTO)

    // Assert
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/reports"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(STUB_DTO),
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
    const act = () => createReport(STUB_DTO)

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
    const act = () => createReport(STUB_DTO)

    // Assert
    await expect(act()).rejects.toThrow("Serviço temporariamente indisponível.")
  })
})
