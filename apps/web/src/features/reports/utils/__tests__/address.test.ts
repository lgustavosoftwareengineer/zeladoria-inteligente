import { formatLocation } from "../address"
import type { ReportFormValues } from "../../schemas/report.schema"

const BASE_VALUES: ReportFormValues = {
  title: "Buraco na rua",
  description: "Buraco grande na calçada.",
  cep: "01001-000",
  street: "Praça da Sé",
  number: "1",
  complement: "",
  neighborhood: "Sé",
  city: "São Paulo",
  state: "SP",
}

describe("formatLocation", () => {
  it("should join all address parts when complement is empty", () => {
    // Arrange
    const values: ReportFormValues = { ...BASE_VALUES, complement: "" }

    // Act
    const result = formatLocation(values)

    // Assert
    expect(result).toBe("Praça da Sé, 1, Sé, São Paulo - SP, CEP 01001-000")
  })

  it("should include complement when provided", () => {
    // Arrange
    const values: ReportFormValues = { ...BASE_VALUES, complement: "Apto 42" }

    // Act
    const result = formatLocation(values)

    // Assert
    expect(result).toBe(
      "Praça da Sé, 1, Apto 42, Sé, São Paulo - SP, CEP 01001-000",
    )
  })

  it("should omit complement when undefined", () => {
    // Arrange
    const values: ReportFormValues = { ...BASE_VALUES, complement: undefined }

    // Act
    const result = formatLocation(values)

    // Assert
    expect(result).toBe("Praça da Sé, 1, Sé, São Paulo - SP, CEP 01001-000")
  })
})
