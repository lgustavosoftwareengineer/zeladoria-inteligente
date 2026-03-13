import type { ReportFormValues } from "../schemas/report.schema"

export const STUB_BASE_VALUES: ReportFormValues = {
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
