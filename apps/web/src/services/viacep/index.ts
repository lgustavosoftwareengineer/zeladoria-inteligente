export type ViaCepAddress = {
  street: string
  neighborhood: string
  city: string
  state: string
}

type ViaCepResponse = {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export async function fetchAddressByCep(cep: string): Promise<ViaCepAddress> {
  const sanitizedCep = cep.replace(/\D/g, "")
  const response = await fetch(`https://viacep.com.br/ws/${sanitizedCep}/json/`)

  if (!response.ok) {
    throw new Error("Não foi possível consultar o CEP.")
  }

  const data = (await response.json()) as ViaCepResponse

  if (data.erro) {
    throw new Error("CEP não encontrado.")
  }

  return {
    street: data.logradouro,
    neighborhood: data.bairro,
    city: data.localidade,
    state: data.uf,
  }
}
