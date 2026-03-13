import type { ReportFormValues } from "@/features/reports/schemas/report.schema"
import { formatLocation } from "../address"
import { STUB_BASE_VALUES } from "../stubs"

describe("formatLocation", () => {
  it("should join all address parts when complement is empty", () => {
    // Arrange
    const values: ReportFormValues = { ...STUB_BASE_VALUES, complement: "" }

    // Act
    const result = formatLocation(values)

    // Assert
    expect(result).toBe("Praça da Sé, 1, Sé, São Paulo - SP, CEP 01001-000")
  })

  it("should include complement when provided", () => {
    // Arrange
    const values: ReportFormValues = {
      ...STUB_BASE_VALUES,
      complement: "Apto 42",
    }

    // Act
    const result = formatLocation(values)

    // Assert
    expect(result).toBe(
      "Praça da Sé, 1, Apto 42, Sé, São Paulo - SP, CEP 01001-000",
    )
  })

  it("should omit complement when undefined", () => {
    // Arrange
    const values: ReportFormValues = {
      ...STUB_BASE_VALUES,
      complement: undefined,
    }

    // Act
    const result = formatLocation(values)

    // Assert
    expect(result).toBe("Praça da Sé, 1, Sé, São Paulo - SP, CEP 01001-000")
  })

  it("should format without number when number is empty or undefined", () => {
    // Arrange
    const values: ReportFormValues = { ...STUB_BASE_VALUES, number: "" }

    // Act
    const result = formatLocation(values)

    // Assert
    expect(result).toBe("Praça da Sé, Sé, São Paulo - SP, CEP 01001-000")
  })
})
