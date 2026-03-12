import { z } from "zod"
import type { Resolver } from "react-hook-form"

export const reportSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres."),
  description: z
    .string()
    .min(10, "A descrição deve ter pelo menos 10 caracteres."),
  cep: z
    .string()
    .min(1, "O CEP é obrigatório.")
    .regex(/^\d{5}-?\d{3}$/, "CEP inválido."),
  street: z.string().min(1, "A rua é obrigatória."),
  number: z.string().min(1, "O número é obrigatório."),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "O bairro é obrigatório."),
  city: z.string().min(1, "A cidade é obrigatória."),
  state: z.string().min(1, "O estado é obrigatório."),
})

export type ReportFormValues = z.infer<typeof reportSchema>

export const reportResolver: Resolver<ReportFormValues> = (values) => {
  const {
    success: isSuccess,
    data,
    error: errorData,
  } = reportSchema.safeParse(values)

  if (isSuccess) {
    return Promise.resolve({ values: data, errors: {} })
  }

  const errors = Object.fromEntries(
    errorData.issues.map(({ code, message, path }) => [
      path.join("."),
      { message: message, type: code },
    ]),
  )

  return Promise.resolve({ values: {}, errors })
}
