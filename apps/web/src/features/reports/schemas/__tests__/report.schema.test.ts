import {
  buildReportResolver,
  reportResolver,
  reportSchema,
} from "../report.schema"
import type { ReportFormValues } from "../report.schema"
import { STUB_DETAILED_VALUES } from "../stubs"

describe("reportSchema", () => {
  it("should pass with valid values", () => {
    // Act
    const result = reportSchema.safeParse(STUB_DETAILED_VALUES)

    // Assert
    expect(result.success).toBe(true)
  })

  it("should fail when title is shorter than 3 characters", () => {
    // Arrange
    const values = { ...STUB_DETAILED_VALUES, title: "Ab" }

    // Act
    const result = reportSchema.safeParse(values)

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("title")
    }
  })

  it("should fail when description is shorter than 10 characters", () => {
    // Arrange
    const values = { ...STUB_DETAILED_VALUES, description: "Curta" }

    // Act
    const result = reportSchema.safeParse(values)

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("description")
    }
  })

  it("should fail with invalid CEP format", () => {
    // Arrange
    const values = { ...STUB_DETAILED_VALUES, cep: "123" }

    // Act
    const result = reportSchema.safeParse(values)

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("cep")
    }
  })

  it("should accept CEP without hyphen", () => {
    // Arrange
    const values = { ...STUB_DETAILED_VALUES, cep: "01001000" }

    // Act
    const result = reportSchema.safeParse(values)

    // Assert
    expect(result.success).toBe(true)
  })

  it("should fail when a required address field is empty", () => {
    // Arrange
    const values = { ...STUB_DETAILED_VALUES, street: "" }

    // Act
    const result = reportSchema.safeParse(values)

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("street")
    }
  })

  it("should allow complement and locationText to be optional", () => {
    // Arrange
    const values = {
      ...STUB_DETAILED_VALUES,
      complement: undefined,
      locationText: undefined,
    }

    // Act
    const result = reportSchema.safeParse(values)

    // Assert
    expect(result.success).toBe(true)
  })

  it("should allow number to be optional (street and neighborhood only)", () => {
    // Arrange
    const values = {
      ...STUB_DETAILED_VALUES,
      number: "",
    }

    // Act
    const result = reportSchema.safeParse(values)

    // Assert
    expect(result.success).toBe(true)
  })
})

describe("reportResolver (detailed mode)", () => {
  it("should return data when values are valid", async () => {
    // Act
    const result = await reportResolver(
      STUB_DETAILED_VALUES,
      undefined,
      {} as never,
    )

    // Assert
    expect(result.values).toMatchObject({ title: "Buraco na rua" })
    expect(result.errors).toEqual({})
  })

  it("should return errors keyed by field path when values are invalid", async () => {
    // Arrange
    const invalidValues = { ...STUB_DETAILED_VALUES, title: "Ab", cep: "123" }

    // Act
    const result = await reportResolver(
      invalidValues as ReportFormValues,
      undefined,
      {} as never,
    )

    // Assert
    expect(result.values).toEqual({})
    expect(result.errors).toHaveProperty("title")
    expect(result.errors).toHaveProperty("cep")
  })
})

describe("buildReportResolver('simple')", () => {
  const simpleResolver = buildReportResolver("simple")

  it("should pass with title, description and locationText — without address fields", async () => {
    // Arrange
    const values: ReportFormValues = {
      ...STUB_DETAILED_VALUES,
      locationText: "Praça da Sé, próximo ao metrô",
      cep: "",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
    }

    // Act
    const result = await simpleResolver(values, undefined, {} as never)

    // Assert
    expect(result.errors).toEqual({})
  })

  it("should fail when locationText is too short", async () => {
    // Arrange
    const values: ReportFormValues = {
      ...STUB_DETAILED_VALUES,
      locationText: "Ru",
      cep: "",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
    }

    // Act
    const result = await simpleResolver(values, undefined, {} as never)

    // Assert
    expect(result.errors).toHaveProperty("locationText")
  })

  it("should fail when locationText is empty", async () => {
    // Arrange
    const values: ReportFormValues = {
      ...STUB_DETAILED_VALUES,
      locationText: "",
      cep: "",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
    }

    // Act
    const result = await simpleResolver(values, undefined, {} as never)

    // Assert
    expect(result.errors).toHaveProperty("locationText")
  })

  it("should not require CEP or address fields", async () => {
    // Arrange — all address fields empty, only locationText filled
    const values: ReportFormValues = {
      title: "Buraco na rua",
      description: "Há um buraco enorme na calçada.",
      locationText: "Próximo ao terminal de ônibus central",
      locationMode: undefined,
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    } as unknown as ReportFormValues

    // Act
    const result = await simpleResolver(values, undefined, {} as never)

    // Assert
    expect(result.errors).toEqual({})
    expect(result.errors).not.toHaveProperty("cep")
    expect(result.errors).not.toHaveProperty("street")
  })
})
