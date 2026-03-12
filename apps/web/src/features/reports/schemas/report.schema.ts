import { z } from "zod"
import type { Resolver } from "react-hook-form"

export type LocationMode = "simple" | "detailed"

export const reportSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres."),
  description: z
    .string()
    .min(10, "A descrição deve ter pelo menos 10 caracteres."),
  locationText: z.string().optional(),
  cep: z
    .string()
    .min(1, "O CEP é obrigatório.")
    .regex(/^\d{5}-?\d{3}$/, "CEP inválido."),
  street: z.string().min(1, "A rua é obrigatória."),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "O bairro é obrigatório."),
  city: z.string().min(1, "A cidade é obrigatória."),
  state: z.string().min(1, "O estado é obrigatório."),
})

const simpleLocationSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres."),
  description: z
    .string()
    .min(10, "A descrição deve ter pelo menos 10 caracteres."),
  locationText: z
    .string()
    .min(3, "A localização deve ter pelo menos 3 caracteres."),
})

export type ReportFormValues = z.infer<typeof reportSchema>

function buildResolver(schema: z.ZodTypeAny): Resolver<ReportFormValues> {
  return (values) => {
    const {
      success: isSuccess,
      data,
      error: errorData,
    } = schema.safeParse(values)

    if (isSuccess) {
      return Promise.resolve({ values: data as ReportFormValues, errors: {} })
    }

    const errors = Object.fromEntries(
      errorData.issues.map(({ code, message, path }) => [
        path.join("."),
        { message, type: code },
      ]),
    )

    return Promise.resolve({ values: {}, errors })
  }
}

export function buildReportResolver(
  mode: LocationMode,
): Resolver<ReportFormValues> {
  return buildResolver(mode === "simple" ? simpleLocationSchema : reportSchema)
}

export const reportResolver = buildReportResolver("detailed")
