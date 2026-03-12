import { ReportFormValues } from "../schemas/report.schema"

export function formatLocation(values: ReportFormValues): string {
  const streetPart = values.number
    ? `${values.street}, ${values.number}`
    : values.street
  const parts = [
    streetPart,
    values.complement,
    values.neighborhood,
    `${values.city} - ${values.state}`,
    `CEP ${values.cep}`,
  ].filter(Boolean)

  return parts.join(", ")
}
