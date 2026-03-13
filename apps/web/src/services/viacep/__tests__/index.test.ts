import { fetchAddressByCep } from "../index"
import { STUB_VALID_RESPONSE } from "../stubs"

describe("fetchAddressByCep", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("should return parsed address on success", async () => {
    // Arrange
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(STUB_VALID_RESPONSE),
    } as Response)

    // Act
    const result = await fetchAddressByCep("01001-000")

    // Assert
    expect(result).toEqual({
      street: "Praça da Sé",
      neighborhood: "Sé",
      city: "São Paulo",
      state: "SP",
    })
  })

  it("should strip non-digits from CEP before fetching", async () => {
    // Arrange
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(STUB_VALID_RESPONSE),
    } as Response)

    // Act
    await fetchAddressByCep("01001-000")

    // Assert
    expect(fetch).toHaveBeenCalledWith(
      "https://viacep.com.br/ws/01001000/json/",
    )
  })

  it("should throw when response is not ok", async () => {
    // Arrange
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    } as Response)

    // Act
    const act = () => fetchAddressByCep("00000000")

    // Assert
    await expect(act()).rejects.toThrow("Não foi possível consultar o CEP.")
  })

  it("should throw when ViaCEP returns erro flag", async () => {
    // Arrange
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...STUB_VALID_RESPONSE, erro: true }),
    } as Response)

    // Act
    const act = () => fetchAddressByCep("99999999")

    // Assert
    await expect(act()).rejects.toThrow("CEP não encontrado.")
  })
})
