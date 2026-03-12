import { ReportFormValues } from "../schemas/report.schema"

export function formatLocation(values: ReportFormValues): string {
  const parts = [
    `${values.street}, ${values.number}`,
    values.complement,
    values.neighborhood,
    `${values.city} - ${values.state}`,
    `CEP ${values.cep}`,
  ].filter(Boolean)

  return parts.join(", ")
}
