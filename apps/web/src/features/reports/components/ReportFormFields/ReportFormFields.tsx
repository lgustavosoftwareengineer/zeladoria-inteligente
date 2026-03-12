"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/Button"
import { Field } from "@/components/ui/Field"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { fetchAddressByCep } from "@/services/viacep"
import type { ReportFormValues } from "../../schemas/report.schema"
import type { CreateReportDto, ReportResponse } from "../../types/report.types"
import type { UseMutationResult } from "@tanstack/react-query"
import type {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form"

export type ReportFormFieldsProps = {
  register: UseFormRegister<ReportFormValues>
  handleSubmit: UseFormHandleSubmit<ReportFormValues>
  onSubmit: (values: ReportFormValues) => void
  errors: FieldErrors<ReportFormValues>
  dirtyFields: Partial<Record<keyof ReportFormValues, boolean>>
  setValue: UseFormSetValue<ReportFormValues>
  cepMutation: UseMutationResult<
    Awaited<ReturnType<typeof fetchAddressByCep>>,
    Error,
    string
  >
  reportMutation: UseMutationResult<ReportResponse, Error, CreateReportDto>
  handleCepBlur: (event: React.FocusEvent<HTMLInputElement>) => void
}

export function ReportFormFields({
  register,
  handleSubmit,
  onSubmit,
  errors,
  dirtyFields,
  setValue,
  cepMutation,
  reportMutation,
  handleCepBlur,
}: ReportFormFieldsProps) {
  const shouldAddressFieldBeReadonly =
    cepMutation.isSuccess && !!dirtyFields.cep

  const handleOnChangeCEP = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value.replace(/\D/g, "")
      event.target.value =
        raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5, 8)}` : raw

      if (raw.length === 0) {
        cepMutation.reset()
        setValue("street", "")
        setValue("neighborhood", "")
        setValue("city", "")
        setValue("state", "")
      }
    },
    [cepMutation, setValue],
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {reportMutation.isError && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {reportMutation.error instanceof Error
            ? reportMutation.error.message
            : "Ocorreu um erro inesperado."}
        </div>
      )}

      <Field id="title" label="Título" required error={errors.title?.message}>
        <Input
          id="title"
          type="text"
          placeholder="Ex: Buraco na calçada"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
          {...register("title")}
        />
      </Field>

      <Field
        id="description"
        label="Descrição do problema"
        required
        error={errors.description?.message}
      >
        <Textarea
          id="description"
          rows={4}
          placeholder="Descreva o problema com detalhes..."
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description ? "description-error" : undefined
          }
          {...register("description")}
        />
      </Field>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Localização</p>

        <div className="grid grid-cols-2 gap-3">
          <Field
            id="cep"
            label="CEP"
            required
            error={errors.cep?.message}
            className="col-span-1"
          >
            <div className="relative">
              <Input
                id="cep"
                type="text"
                placeholder="00000-000"
                maxLength={9}
                aria-invalid={!!errors.cep}
                aria-describedby={errors.cep ? "cep-error" : undefined}
                {...register("cep", {
                  onBlur: handleCepBlur,
                  onChange: handleOnChangeCEP,
                })}
              />
              {cepMutation.isPending && (
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center"
                  aria-hidden
                >
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                </div>
              )}
            </div>
          </Field>

          <Field
            id="number"
            label="Número"
            required
            error={errors.number?.message}
            className="col-span-1"
          >
            <Input
              id="number"
              type="text"
              placeholder="Ex: 123"
              aria-invalid={!!errors.number}
              aria-describedby={errors.number ? "number-error" : undefined}
              {...register("number")}
            />
          </Field>
        </div>

        <Field id="street" label="Rua" required error={errors.street?.message}>
          <Input
            id="street"
            type="text"
            placeholder="Preenchido automaticamente pelo CEP"
            readOnly={shouldAddressFieldBeReadonly}
            aria-invalid={!!errors.street}
            aria-describedby={errors.street ? "street-error" : undefined}
            {...register("street")}
          />
        </Field>

        <Field
          id="complement"
          label="Complemento"
          error={errors.complement?.message}
        >
          <Input
            id="complement"
            type="text"
            placeholder="Apto, bloco, referência... (opcional)"
            aria-invalid={!!errors.complement}
            aria-describedby={
              errors.complement ? "complement-error" : undefined
            }
            {...register("complement")}
          />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field
            id="neighborhood"
            label="Bairro"
            required
            error={errors.neighborhood?.message}
            className="col-span-3 sm:col-span-1"
          >
            <Input
              id="neighborhood"
              type="text"
              placeholder="Bairro"
              readOnly={shouldAddressFieldBeReadonly}
              aria-invalid={!!errors.neighborhood}
              aria-describedby={
                errors.neighborhood ? "neighborhood-error" : undefined
              }
              {...register("neighborhood")}
            />
          </Field>

          <Field
            id="city"
            label="Cidade"
            required
            error={errors.city?.message}
            className="col-span-2 sm:col-span-1"
          >
            <Input
              id="city"
              type="text"
              placeholder="Cidade"
              readOnly={shouldAddressFieldBeReadonly}
              aria-invalid={!!errors.city}
              aria-describedby={errors.city ? "city-error" : undefined}
              {...register("city")}
            />
          </Field>

          <Field
            id="state"
            label="UF"
            required
            error={errors.state?.message}
            className="col-span-1"
          >
            <Input
              id="state"
              type="text"
              placeholder="UF"
              maxLength={2}
              readOnly={shouldAddressFieldBeReadonly}
              aria-invalid={!!errors.state}
              aria-describedby={errors.state ? "state-error" : undefined}
              {...register("state")}
            />
          </Field>
        </div>
      </div>

      <Button type="submit" variant="primary">
        Enviar Ocorrência
      </Button>
    </form>
  )
}
